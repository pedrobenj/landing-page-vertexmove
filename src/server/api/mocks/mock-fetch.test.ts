import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { AdminLoginResponse } from "@/types/api/admin-auth.interface"
import type { AdminEvent } from "@/types/api/admin-event.interface"
import type { AuditEntry } from "@/types/api/audit-entry.interface"
import type { CursorPage } from "@/types/api/cursor-page.interface"
import type { PublicEvent } from "@/types/api/event.interface"
import type { PartnerRace } from "@/types/api/partner-race.interface"
import type { PublicEventDetail } from "@/types/api/public-event-detail.interface"
import type { RegistrationCheckout, RegistrationDetails } from "@/types/api/registration-details.interface"
import type { CreatedRegistration, RegistrationLookupItem } from "@/types/api/registration.interface"

import { resetMockDb } from "./mock-db"
import { mockFetch } from "./mock-fetch"

interface CallOptions {
  body?: unknown
  headers?: Record<string, string>
}

function call(method: string, path: string, { body, headers }: CallOptions = {}): Promise<Response> {
  return mockFetch(`http://api.test/api/v1${path}`, {
    method,
    headers: { Accept: "application/json", ...(body === undefined ? {} : { "Content-Type": "application/json" }), ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

async function errorCode(res: Response): Promise<string> {
  const body = (await res.json()) as { error: { codigo: string } }
  return body.error.codigo
}

const VALID_CPF = "52998224725"
const OTHER_CPF = "11144477735"
const SLUG = "corrida-vertex-beira-mar-2026"

async function getDetail(slug = SLUG): Promise<PublicEventDetail> {
  return (await (await call("GET", `/eventos/${slug}`)).json()) as PublicEventDetail
}

async function registrationBody(overrides: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
  const detail = await getDetail()
  return {
    eventoSlug: SLUG,
    distanciaId: detail.distancias![0].id,
    nomeCompleto: "Ana Maria Silva",
    dataNascimento: "1990-05-10",
    cpf: VALID_CPF,
    whatsapp: "+5585999999999",
    email: "ana@example.com",
    documentosAceitos: detail.documentosVigentes!.map((document) => document.id),
    ...overrides,
  }
}

async function login(email = "admin@example.com", senha = "Vertex@Dev12345"): Promise<Response> {
  return call("POST", "/admin/auth/login", { body: { email, senha } })
}

async function bearer(): Promise<Record<string, string>> {
  const body = (await (await login()).json()) as AdminLoginResponse
  return { Authorization: `Bearer ${body.accessToken}` }
}

function cookieValue(setCookies: string[], name: string): string {
  const cookie = setCookies.find((item) => item.startsWith(`${name}=`))!
  return cookie.split(";")[0].slice(name.length + 1)
}

describe("mockFetch", () => {
  beforeEach(() => {
    resetMockDb()
  })

  describe("catálogo público", () => {
    it("lista só eventos publicados, por data, sem id nem status", async () => {
      const res = await call("GET", "/eventos")
      const page = (await res.json()) as CursorPage<PublicEvent>

      expect(res.status).toBe(200)
      expect(page.items.map((event) => event.slug)).toEqual([
        "corrida-vertex-beira-mar-2026",
        "night-run-vertex-aterro",
        "desafio-vertex-parque-do-coco",
      ])
      expect(page.nextCursor).toBeNull()
      expect(page.items[0]).not.toHaveProperty("id")
      expect(page.items[0]).not.toHaveProperty("status")
      expect(page.items[0].localizacao.cidade).toBe("Fortaleza")
    })

    it("pagina por cursor", async () => {
      const first = (await (await call("GET", "/eventos?limit=2")).json()) as CursorPage<PublicEvent>
      expect(first.items).toHaveLength(2)
      expect(first.nextCursor).not.toBeNull()

      const second = (await (await call("GET", `/eventos?limit=2&cursor=${first.nextCursor}`)).json()) as CursorPage<PublicEvent>
      expect(second.items.map((event) => event.slug)).toEqual(["desafio-vertex-parque-do-coco"])
      expect(second.nextCursor).toBeNull()
    })

    it("recusa limit fora de 1–100", async () => {
      const res = await call("GET", "/eventos?limit=500")
      expect(res.status).toBe(422)
      expect(await errorCode(res)).toBe("DADO_INVALIDO")
    })

    it("lista as corridas encerradas da mais recente para a mais antiga", async () => {
      const page = (await (await call("GET", "/eventos/encerrados")).json()) as CursorPage<PublicEvent>

      expect(page.items.map((event) => event.nome)).toEqual([
        "Corrida das Mães Vertex 2026",
        "Vertex Cocó Trail 2026",
        "Corrida Vertex Beira-Mar 2025",
        "Night Run Vertex 2025",
      ])
      expect(page.items.every((event) => event.imagemCapaUrl === null)).toBe(true)
    })

    it("lista as corridas parceiras com cupom", async () => {
      const res = await call("GET", "/corridas-parceiras")
      const races = (await res.json()) as PartnerRace[]

      expect(res.status).toBe(200)
      expect(races).toHaveLength(3)
      expect(races.every((race) => race.cupom === "VERTEX10")).toBe(true)
    })

    it("devolve o detalhe com distâncias, lote vigente, kits, tamanhos e documentos", async () => {
      const detail = await getDetail()

      expect(detail.nome).toBe("Corrida Vertex Beira-Mar 2026")
      expect(detail).not.toHaveProperty("id")
      expect(detail.distancias!.map((distance) => distance.nome)).toEqual(["5 km", "10 km", "Caminhada 3 km"])
      expect(detail.distancias![0].loteVigente).toEqual({ nome: "1º lote", precoCentavos: 8990 })
      expect(detail.kits!.map((kit) => kit.nome)).toEqual(["Kit Camisa + Medalha", "Kit Camisa"])
      expect(detail.tamanhosCamisa!.map((size) => size.codigo)).toEqual(["PP", "P", "M", "G", "GG", "XGG"])
      expect(detail.documentosVigentes!.map((document) => document.tipo)).toEqual(["regulamento", "termo_responsabilidade"])
    })

    it("marca a distância lotada como esgotada", async () => {
      const detail = await getDetail("night-run-vertex-aterro")
      const tenK = detail.distancias!.find((distance) => distance.nome === "10 km")!

      expect(tenK.esgotado).toBe(true)
      expect(detail.distancias!.filter((distance) => distance.esgotado)).toHaveLength(1)
    })

    it("responde 404 para evento em rascunho ou encerrado", async () => {
      for (const slug of ["corrida-de-natal-vertex-2026", "corrida-vertex-beira-mar-2025", "nao-existe"]) {
        const res = await call("GET", `/eventos/${slug}`)
        expect(res.status).toBe(404)
        expect(await errorCode(res)).toBe("NAO_ENCONTRADO")
      }
    })

    it("responde 404 NAO_ENCONTRADO para rota desconhecida", async () => {
      const res = await call("GET", "/rota-que-nao-existe")
      expect(res.status).toBe(404)
      expect(await errorCode(res)).toBe("NAO_ENCONTRADO")
    })
  })

  describe("POST /inscricoes", () => {
    it("cria a inscrição pendente sem devolver PII", async () => {
      const res = await call("POST", "/inscricoes", { body: await registrationBody() })
      const body = (await res.json()) as CreatedRegistration

      expect(res.status).toBe(201)
      expect(body.codigo).toMatch(/^VX-\d{4}-\d{8}$/)
      expect(body).toMatchObject({
        status: "pendente",
        valorBaseCentavos: 8990,
        valorDescontoCentavos: 0,
        valorTotalCentavos: 8990,
      })
      expect(JSON.stringify(body)).not.toContain(VALID_CPF)
      expect(JSON.stringify(body)).not.toContain("Ana")
    })

    it("dá 50% de desconto para quem tem 60 anos ou mais na data da prova", async () => {
      const res = await call("POST", "/inscricoes", { body: await registrationBody({ dataNascimento: "1960-01-01" }) })
      const body = (await res.json()) as CreatedRegistration

      expect(body.valorDescontoCentavos).toBe(4495)
      expect(body.valorTotalCentavos).toBe(4495)
    })

    it("recusa duplicata na mesma distância com 409", async () => {
      const body = await registrationBody()
      await call("POST", "/inscricoes", { body })

      const res = await call("POST", "/inscricoes", { body })
      expect(res.status).toBe(409)
      expect(await errorCode(res)).toBe("INSCRICAO_DUPLICADA")
    })

    it("recusa duplicata por WhatsApp + nome + nascimento", async () => {
      await call("POST", "/inscricoes", { body: await registrationBody({ cpf: undefined }) })

      const res = await call("POST", "/inscricoes", { body: await registrationBody({ cpf: undefined, nomeCompleto: "ana maria silva" }) })
      expect(res.status).toBe(409)
      expect(await errorCode(res)).toBe("INSCRICAO_DUPLICADA")
    })

    it("permite outro atleta da mesma família no mesmo WhatsApp", async () => {
      await call("POST", "/inscricoes", { body: await registrationBody({ cpf: undefined }) })

      const res = await call("POST", "/inscricoes", {
        body: await registrationBody({ cpf: undefined, nomeCompleto: "Pedro Silva", dataNascimento: "2012-03-01" }),
      })
      expect(res.status).toBe(201)
    })

    it("recusa CPF já ligado a outro WhatsApp com 409 IDENTIDADES_CONFLITANTES", async () => {
      await call("POST", "/inscricoes", { body: await registrationBody() })
      const detail = await getDetail()

      const res = await call("POST", "/inscricoes", {
        body: await registrationBody({ distanciaId: detail.distancias![1].id, whatsapp: "+5585988887777" }),
      })
      expect(res.status).toBe(409)
      expect(await errorCode(res)).toBe("IDENTIDADES_CONFLITANTES")
    })

    it("exige os documentos vigentes com 422", async () => {
      const res = await call("POST", "/inscricoes", { body: await registrationBody({ documentosAceitos: [101] }) })
      expect(res.status).toBe(422)
      expect(await errorCode(res)).toBe("DOCUMENTO_ACEITE_OBRIGATORIO")
    })

    it("exige CPF ou WhatsApp e valida o CPF", async () => {
      const semIdentificacao = await call("POST", "/inscricoes", {
        body: await registrationBody({ cpf: undefined, whatsapp: undefined }),
      })
      expect(semIdentificacao.status).toBe(422)
      expect(await errorCode(semIdentificacao)).toBe("DADO_INVALIDO")

      const cpfInvalido = await call("POST", "/inscricoes", { body: await registrationBody({ cpf: "12345678900" }) })
      expect(cpfInvalido.status).toBe(422)
    })

    it("recusa distância esgotada", async () => {
      const detail = await getDetail("night-run-vertex-aterro")
      const soldOut = detail.distancias!.find((distance) => distance.esgotado)!

      const res = await call("POST", "/inscricoes", {
        body: await registrationBody({
          eventoSlug: "night-run-vertex-aterro",
          distanciaId: soldOut.id,
          documentosAceitos: detail.documentosVigentes!.map((document) => document.id),
        }),
      })
      expect(res.status).toBe(409)
      expect(await errorCode(res)).toBe("DISTANCIA_ESGOTADA")
    })
  })

  describe("pagamento (Checkout Pro)", () => {
    async function createCode(): Promise<string> {
      const res = await call("POST", "/inscricoes", { body: await registrationBody() })
      return ((await res.json()) as CreatedRegistration).codigo
    }

    afterEach(() => {
      vi.useRealTimers()
    })

    it("GET /inscricoes/:codigo devolve o status sem PII", async () => {
      const codigo = await createCode()
      const res = await call("GET", `/inscricoes/${codigo}`)
      const body = (await res.json()) as RegistrationDetails

      expect(res.status).toBe(200)
      expect(body).toMatchObject({ codigo, status: "pendente", pagamento: null, valorTotalCentavos: 8990 })
      expect(body.evento.nome).toBe("Corrida Vertex Beira-Mar 2026")
      expect(JSON.stringify(body)).not.toContain(VALID_CPF)
      expect(JSON.stringify(body)).not.toContain("Ana")
    })

    it("GET de código inexistente dá 404", async () => {
      expect((await call("GET", "/inscricoes/VX-2026-99999999")).status).toBe(404)
    })

    it("cria o link do checkout falso para inscrição pendente", async () => {
      const codigo = await createCode()
      const res = await call("POST", `/inscricoes/${codigo}/pagamento`)
      expect(res.status).toBe(201)
      expect(((await res.json()) as RegistrationCheckout).checkoutUrl).toBe(`/dev/checkout-pro/${codigo}`)
    })

    it("aprova só depois do atraso do webhook e então recusa novo link", async () => {
      vi.useFakeTimers({ toFake: ["Date"] })
      const codigo = await createCode()
      expect((await call("POST", `/dev/pagamentos/${codigo}`, { body: { resultado: "aprovado" } })).status).toBe(204)

      const before = (await (await call("GET", `/inscricoes/${codigo}`)).json()) as RegistrationDetails
      expect(before.status).toBe("pendente")

      vi.setSystemTime(Date.now() + 5_000)
      const after = (await (await call("GET", `/inscricoes/${codigo}`)).json()) as RegistrationDetails
      expect(after).toMatchObject({ status: "confirmada", pagamento: { status: "aprovado" } })

      const res = await call("POST", `/inscricoes/${codigo}/pagamento`)
      expect(res.status).toBe(409)
      expect(await errorCode(res)).toBe("PAGAMENTO_INDISPONIVEL")
    })

    it("pagamento recusado mantém a inscrição pendente", async () => {
      const codigo = await createCode()
      await call("POST", `/dev/pagamentos/${codigo}`, { body: { resultado: "recusado" } })
      const body = (await (await call("GET", `/inscricoes/${codigo}`)).json()) as RegistrationDetails
      expect(body).toMatchObject({ status: "pendente", pagamento: { status: "recusado" } })
    })
  })

  describe("POST /inscricoes/consulta", () => {
    it("recusa CPF e WhatsApp juntos com 422", async () => {
      const res = await call("POST", "/inscricoes/consulta", { body: { cpf: VALID_CPF, whatsapp: "+5585999999999" } })
      expect(res.status).toBe(422)
      expect(await errorCode(res)).toBe("DADO_INVALIDO")
    })

    it("devolve a lista mascarada, sem código nem valores", async () => {
      await call("POST", "/inscricoes", { body: await registrationBody() })

      const res = await call("POST", "/inscricoes/consulta", { body: { whatsapp: "+5585999999999" } })
      const page = (await res.json()) as CursorPage<RegistrationLookupItem>

      expect(res.status).toBe(200)
      expect(page.items).toHaveLength(1)
      expect(page.items[0]).toMatchObject({
        nomeMascarado: "Ana S****",
        evento: "Corrida Vertex Beira-Mar 2026",
        distancia: "5 km",
        status: "pendente",
      })
      expect(page.items[0]).not.toHaveProperty("codigo")
    })

    it("devolve lista vazia para CPF sem inscrições", async () => {
      const res = await call("POST", "/inscricoes/consulta", { body: { cpf: OTHER_CPF } })
      expect(await res.json()).toEqual({ items: [], nextCursor: null })
    })
  })

  describe("autenticação admin", () => {
    it("faz login e devolve os cookies de sessão", async () => {
      const res = await login()
      const body = (await res.json()) as AdminLoginResponse
      const cookies = res.headers.getSetCookie()

      expect(res.status).toBe(200)
      expect(body).toMatchObject({ tokenType: "Bearer", expiresIn: 900, admin: { nome: "Organização Vertex", papel: "organizacao" } })
      expect(cookies).toHaveLength(2)
      expect(cookies[0]).toMatch(/^vm_admin_rt=mock-rt\..+; Path=\/api\/v1\/admin\/auth; HttpOnly; Max-Age=604800; SameSite=Strict$/)
      expect(cookieValue(cookies, "vm_admin_csrf")).toBe(body.csrfToken)
    })

    it("recusa senha errada com 401 e bloqueia depois de 5 falhas", async () => {
      for (let attempt = 0; attempt < 5; attempt++) {
        const res = await login("operador@example.com", "errada")
        expect(res.status).toBe(401)
        expect(await errorCode(res)).toBe("NAO_AUTENTICADO")
      }
      expect((await login("operador@example.com")).status).toBe(401)
    })

    it("responde 401 genérico para corpo de login inválido", async () => {
      const res = await call("POST", "/admin/auth/login", { body: { email: "admin@example.com" } })
      expect(res.status).toBe(401)
      expect(await errorCode(res)).toBe("NAO_AUTENTICADO")
    })

    it("exige MFA do super admin", async () => {
      const res = await login("superadmin@example.com")
      expect(res.status).toBe(403)
      expect(await errorCode(res)).toBe("MFA_NECESSARIO")
    })

    it("recusa refresh com csrf diferente com 403 e rotaciona com csrf correto", async () => {
      const cookies = (await login()).headers.getSetCookie()
      const rt = cookieValue(cookies, "vm_admin_rt")
      const csrf = cookieValue(cookies, "vm_admin_csrf")
      const cookieHeader = `vm_admin_rt=${rt}; vm_admin_csrf=${csrf}`

      const wrong = await call("POST", "/admin/auth/refresh", { headers: { Cookie: cookieHeader, "X-CSRF-Token": "outro" } })
      expect(wrong.status).toBe(403)
      expect(await errorCode(wrong)).toBe("ACESSO_NEGADO")

      const ok = await call("POST", "/admin/auth/refresh", { headers: { Cookie: cookieHeader, "X-CSRF-Token": csrf } })
      expect(ok.status).toBe(200)
      expect(cookieValue(ok.headers.getSetCookie(), "vm_admin_rt")).not.toBe(rt)
    })

    it("faz logout expirando os cookies", async () => {
      const cookies = (await login()).headers.getSetCookie()
      const csrf = cookieValue(cookies, "vm_admin_csrf")
      const res = await call("POST", "/admin/auth/logout", {
        headers: { Cookie: `vm_admin_rt=${cookieValue(cookies, "vm_admin_rt")}; vm_admin_csrf=${csrf}`, "X-CSRF-Token": csrf },
      })

      expect(res.status).toBe(204)
      expect(res.headers.getSetCookie().every((cookie) => cookie.includes("Max-Age=0"))).toBe(true)
    })

    it("exige Bearer válido em /admin/me", async () => {
      expect((await call("GET", "/admin/me")).status).toBe(401)
      expect((await call("GET", "/admin/me", { headers: { Authorization: "Bearer mock-at.invalido" } })).status).toBe(401)

      const res = await call("GET", "/admin/me", { headers: await bearer() })
      expect(await res.json()).toMatchObject({ email: "admin@example.com", papel: "organizacao" })
    })
  })

  describe("eventos admin", () => {
    const newEvent = {
      slug: "corrida-teste",
      nome: "Corrida Teste",
      descricao: "Evento criado no teste.",
      dataEvento: "2027-06-01",
      horarioLargada: "06:00",
      localNome: "Praça Portugal",
      cidade: "Fortaleza",
      uf: "CE",
    }

    it("cria em rascunho com Location e recusa slug duplicado", async () => {
      const auth = await bearer()
      const res = await call("POST", "/admin/eventos", { body: newEvent, headers: auth })
      const event = (await res.json()) as AdminEvent

      expect(res.status).toBe(201)
      expect(res.headers.get("Location")).toBe(`/api/v1/admin/eventos/${event.id}`)
      expect(event).toMatchObject({ status: "rascunho", endereco: null, localizacaoResumo: "Praça Portugal — Fortaleza/CE" })

      const duplicate = await call("POST", "/admin/eventos", { body: newEvent, headers: auth })
      expect(duplicate.status).toBe(409)
      expect(await errorCode(duplicate)).toBe("SLUG_DUPLICADO")
    })

    it("atualiza só os campos enviados", async () => {
      const auth = await bearer()
      const res = await call("PATCH", "/admin/eventos/1", { body: { nome: "Novo nome" }, headers: auth })
      const event = (await res.json()) as AdminEvent

      expect(res.status).toBe(200)
      expect(event.nome).toBe("Novo nome")
      expect(event.endereco).toBe("Av. Almirante Tamandaré, s/n")
    })

    it("recusa transição inválida com 422 e grava auditoria na válida", async () => {
      const auth = await bearer()

      const invalid = await call("POST", "/admin/eventos/4/encerrar", { headers: auth })
      expect(invalid.status).toBe(422)
      expect(await errorCode(invalid)).toBe("TRANSICAO_INVALIDA")

      const publish = await call("POST", "/admin/eventos/4/publicar", { headers: auth })
      expect(publish.status).toBe(204)
      expect((await call("GET", "/eventos/corrida-de-natal-vertex-2026")).status).toBe(200)

      const audit = (await (await call("GET", "/admin/auditoria?limit=1", { headers: auth })).json()) as CursorPage<AuditEntry>
      expect(audit.items[0]).toMatchObject({ acao: "evento.publicado", entidadeId: "4", adminNome: "Organização Vertex" })
    })

    it("exclui com soft delete", async () => {
      const auth = await bearer()
      expect((await call("DELETE", "/admin/eventos/1", { headers: auth })).status).toBe(204)
      expect((await call("GET", "/admin/eventos/1", { headers: auth })).status).toBe(404)
      expect((await call("GET", `/eventos/${SLUG}`)).status).toBe(404)
    })

    it("filtra por status", async () => {
      const page = (await (await call("GET", "/admin/eventos?status=encerrado", { headers: await bearer() })).json()) as CursorPage<AdminEvent>
      expect(page.items).toHaveLength(4)
      expect(page.items.every((event) => event.status === "encerrado")).toBe(true)
    })
  })

  describe("catálogo admin", () => {
    it("exige Bearer", async () => {
      expect((await call("GET", "/admin/eventos/1/distancias")).status).toBe(401)
    })

    it("lista distâncias como array simples e cria lote", async () => {
      const auth = await bearer()
      const distances = (await (await call("GET", "/admin/eventos/1/distancias", { headers: auth })).json()) as Array<{ id: number }>
      expect(distances).toHaveLength(3)
      expect(distances[0]).not.toHaveProperty("vagasOcupadasSeed")

      const res = await call("POST", `/admin/distancias/${distances[0].id}/lotes`, {
        headers: auth,
        body: { nome: "3º lote", precoCentavos: 12990, inicioEm: "2027-01-01T00:00:00-03:00", fimEm: "2027-02-01T00:00:00-03:00" },
      })
      expect(res.status).toBe(201)
      expect(await res.json()).toMatchObject({ nome: "3º lote", distanciaId: distances[0].id, ativo: true })
    })

    it("cria documento versionado e não aceita PATCH", async () => {
      const auth = await bearer()
      const res = await call("POST", "/admin/documentos", {
        headers: auth,
        body: {
          eventoId: 1,
          tipo: "regulamento",
          versao: "2.0",
          titulo: "Regulamento v2",
          url: "https://example.com/regulamento-v2.pdf",
          hashSha256: "a".repeat(64),
          vigenteEm: "2026-01-01T00:00:00-03:00",
        },
      })
      expect(res.status).toBe(201)

      const documents = (await (await call("GET", "/admin/documentos?eventoId=1", { headers: auth })).json()) as unknown[]
      expect(documents).toHaveLength(3)
      expect((await call("PATCH", "/admin/documentos/101", { headers: auth, body: {} })).status).toBe(404)
    })

    it("recusa eventoId inválido com 422 DADO_INVALIDO", async () => {
      const auth = await bearer()
      for (const path of ["/admin/eventos/abc/distancias", "/admin/eventos/0/kits", "/admin/documentos?eventoId=abc"]) {
        const res = await call("GET", path, { headers: auth })
        expect(res.status).toBe(422)
        expect(await errorCode(res)).toBe("DADO_INVALIDO")
      }
      expect((await call("GET", "/admin/eventos/9999/distancias", { headers: auth })).status).toBe(404)
    })
  })

  describe("robustez", () => {
    it("responde 400 para caminho com escape malformado", async () => {
      const res = await call("GET", "/eventos/%E0%A4%A")
      expect(res.status).toBe(400)
      expect(await errorCode(res)).toBe("DADO_INVALIDO")
    })

    it("tolera cookie com escape malformado", async () => {
      const res = await call("POST", "/admin/auth/refresh", { headers: { Cookie: "vm_admin_csrf=%E0%A4%A", "X-CSRF-Token": "%E0%A4%A" } })
      expect(res.status).toBe(401)
    })
  })
})
