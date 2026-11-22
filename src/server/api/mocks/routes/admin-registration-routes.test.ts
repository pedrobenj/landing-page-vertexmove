import { beforeEach, describe, expect, it } from "vitest"

import type { AdminLoginResponse } from "@/types/api/admin-auth.interface"
import type { ApiAdminPayment } from "@/types/api/admin-payment.interface"
import type { ApiAdminRegistration, ApiAdminRegistrationDetails } from "@/types/api/admin-registration.interface"
import type { CursorPage } from "@/types/api/cursor-page.interface"

import { getMockDb, resetMockDb } from "../mock-db"
import { mockFetch } from "../mock-fetch"

function call(method: string, path: string, { body, headers }: { body?: unknown; headers?: Record<string, string> } = {}) {
  return mockFetch(`http://api.test/api/v1${path}`, {
    method,
    headers: { Accept: "application/json", ...(body === undefined ? {} : { "Content-Type": "application/json" }), ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

async function errorCode(res: Response): Promise<string> {
  return ((await res.json()) as { error: { codigo: string } }).error.codigo
}

let auth: Record<string, string>

async function list(query = ""): Promise<CursorPage<ApiAdminRegistration>> {
  const res = await call("GET", `/admin/eventos/1/inscricoes${query}`, { headers: auth })
  expect(res.status).toBe(200)
  return (await res.json()) as CursorPage<ApiAdminRegistration>
}

async function detail(id: number): Promise<ApiAdminRegistrationDetails> {
  const res = await call("GET", `/admin/inscricoes/${id}`, { headers: auth })
  expect(res.status).toBe(200)
  return (await res.json()) as ApiAdminRegistrationDetails
}

async function payments(situacao: string): Promise<CursorPage<ApiAdminPayment>> {
  const res = await call("GET", `/admin/pagamentos?situacao=${situacao}`, { headers: auth })
  expect(res.status).toBe(200)
  return (await res.json()) as CursorPage<ApiAdminPayment>
}

const cancel = (id: number, body: unknown = { motivo: "pedido do atleta" }) => call("POST", `/admin/inscricoes/${id}/cancelar`, { headers: auth, body })

describe("rotas admin de inscrições e pagamentos no mock (contrato da fase 5)", () => {
  beforeEach(async () => {
    resetMockDb()
    const res = await call("POST", "/admin/auth/login", { body: { email: "admin@example.com", senha: "Vertex@Dev12345" } })
    auth = { Authorization: `Bearer ${((await res.json()) as AdminLoginResponse).accessToken}` }
  })

  describe("GET /admin/eventos/:eventoId/inscricoes", () => {
    it("exige sessão", async () => {
      expect((await call("GET", "/admin/eventos/1/inscricoes")).status).toBe(401)
    })

    it("pagina por cursor, mais recentes primeiro, no formato InscricaoAdminResponse", async () => {
      const first = await list()
      expect(first.items).toHaveLength(20)
      expect(first.nextCursor).not.toBeNull()
      const item = first.items.find((registration) => registration.codigo === "VX-2026-00000001") ?? first.items[0]
      expect(first.items[0].codigo).toBe("VX-2026-00000024")
      expect(Object.keys(item).sort()).toEqual(
        ["codigo", "cpfMascarado", "distancia", "id", "inscritoEm", "kit", "kitRetiradoEm", "nomeCompleto", "pagamento", "status", "tamanhoCamisa", "valorTotalCentavos"].sort(),
      )
      expect(first.items[0]).toMatchObject({ distancia: { id: 3, nome: "Caminhada 3 km" }, kit: null, cpfMascarado: null })
      expect(first.items[0].inscritoEm).toMatch(/Z$/)

      const second = await list(`?cursor=${first.nextCursor}`)
      expect(second.items).toHaveLength(4)
      expect(second.nextCursor).toBeNull()
      expect(second.items.at(-1)).toMatchObject({ codigo: "VX-2026-00000001", cpfMascarado: "***.***.***-**", kit: { id: 1, nome: "Kit Camisa + Medalha" }, pagamento: { id: 1, status: "aprovado" } })
    })

    it("filtra por status efetivo, distância e busca (código exato ou trecho do nome)", async () => {
      expect((await list("?status=pendente")).items.map((item) => item.codigo)).toEqual(["VX-2026-00000020", "VX-2026-00000019", "VX-2026-00000018"])
      const tenK = await list("?distanciaId=2")
      expect(tenK.items.length).toBeGreaterThan(0)
      expect(tenK.items.every((item) => item.distancia.nome === "10 km")).toBe(true)
      expect((await list("?busca=João")).items.map((item) => item.nomeCompleto)).toEqual(["João Victor Holanda"])
      expect((await list("?busca=vx-2026-00000003")).items.map((item) => item.codigo)).toEqual(["VX-2026-00000003"])
      // Trecho do código não é busca por código nem casa com nome.
      expect((await list("?busca=00000003")).items).toEqual([])
    })

    it("pendente com a reserva vencida aparece como expirada", async () => {
      getMockDb().registrations[18].inscritoEm = new Date(Date.now() - 31 * 60_000).toISOString()
      expect((await detail(19)).status).toBe("expirada")
      expect((await list("?status=expirada")).items.map((item) => item.codigo)).toContain("VX-2026-00000019")
    })

    it("corrida sem inscritos → lista vazia; inexistente → 404; filtro inválido → 422", async () => {
      expect(await (await call("GET", "/admin/eventos/2/inscricoes", { headers: auth })).json()).toEqual({ items: [], nextCursor: null })
      expect((await call("GET", "/admin/eventos/999/inscricoes", { headers: auth })).status).toBe(404)
      expect((await call("GET", "/admin/eventos/1/inscricoes?status=paga", { headers: auth })).status).toBe(422)
      expect((await call("GET", "/admin/eventos/1/inscricoes?ordem=nome", { headers: auth })).status).toBe(422)
    })
  })

  describe("GET /admin/inscricoes/:id", () => {
    it("traz contato, nascimento, aceites, histórico e pagamentos", async () => {
      const registration = await detail(1)
      expect(registration).toMatchObject({
        id: 1,
        codigo: "VX-2026-00000001",
        evento: { id: 1, nome: "Corrida Vertex Beira-Mar 2026" },
        status: "confirmada",
        nomeCompleto: "Ana Beatriz Lima",
        email: "ana.lima@exemplo.com",
        anonimizado: false,
        kitRetiradoPor: 1,
      })
      expect(registration).not.toHaveProperty("pagamento")
      expect(registration.whatsapp).toMatch(/^\+55\d{11}$/)
      expect(registration.dataNascimento).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(registration.aceites.map((acceptance) => acceptance.documentoTipo)).toEqual(["regulamento", "termo_responsabilidade"])
      expect(registration.historico).toEqual([
        expect.objectContaining({ statusAnterior: null, statusNovo: "pendente", origem: "atleta" }),
        expect.objectContaining({ statusAnterior: "pendente", statusNovo: "confirmada", origem: "gateway", motivo: "pagamento_aprovado" }),
      ])
      expect(registration.pagamentos).toEqual([expect.objectContaining({ id: 1, status: "aprovado", metodo: "bank_transfer" })])
    })

    it("inexistente → 404", async () => {
      expect((await call("GET", "/admin/inscricoes/999", { headers: auth })).status).toBe(404)
    })
  })

  describe("retirada de kit", () => {
    it("marca (200 idempotente, mesmo instante) e desfaz (204)", async () => {
      const path = "/admin/inscricoes/4/retirada-kit"
      const first = await call("POST", path, { headers: auth })
      expect(first.status).toBe(200)
      const body = (await first.json()) as { id: number; kitRetiradoEm: string }
      expect(body.id).toBe(4)
      expect(await (await call("POST", path, { headers: auth })).json()).toEqual(body)

      expect((await call("DELETE", path, { headers: auth })).status).toBe(204)
      expect((await detail(4)).kitRetiradoEm).toBeNull()
      expect((await call("DELETE", path, { headers: auth })).status).toBe(204)
    })

    it("só inscrição confirmada → senão 409", async () => {
      const res = await call("POST", "/admin/inscricoes/19/retirada-kit", { headers: auth })
      expect(res.status).toBe(409)
      expect(await errorCode(res)).toBe("CONFLITO_DE_ESTADO")
    })
  })

  describe("POST /admin/inscricoes/:id/cancelar", () => {
    it("exige motivo", async () => {
      expect((await cancel(5, {})).status).toBe(422)
    })

    it("confirmada com pagamento aprovado → cancelada e estorno sinalizado na fila", async () => {
      const res = await cancel(5)
      expect(res.status).toBe(200)
      expect(await res.json()).toEqual({ id: 5, status: "cancelada", statusAnterior: "confirmada", estornoSinalizado: true, pagamentoId: 5 })
      const registration = await detail(5)
      expect(registration.status).toBe("cancelada")
      expect(registration.historico.at(-1)).toMatchObject({ statusAnterior: "confirmada", statusNovo: "cancelada", origem: "admin", motivo: "pedido do atleta" })
      expect((await payments("estorno_pendente")).items.map((payment) => payment.id)).toContain(5)
    })

    it("pendente → cancelada sem estorno", async () => {
      expect(await (await cancel(19)).json()).toMatchObject({ statusAnterior: "pendente", estornoSinalizado: false, pagamentoId: null })
    })

    it("já cancelada → 200 idempotente; expirada → 409", async () => {
      expect(await (await cancel(21)).json()).toEqual({ id: 21, status: "cancelada", statusAnterior: null, estornoSinalizado: false, pagamentoId: null })
      expect((await cancel(22)).status).toBe(409)
    })

    it("inscrição paga pelo checkout falso do site vira linha de pagamento e entra na fila ao cancelar", async () => {
      const db = getMockDb()
      db.registrations.push({ ...db.registrations[3], id: 99, codigo: "VX-2026-00000099", historico: undefined, pagamentoStatus: "aprovado" as never })
      expect((await detail(99)).pagamentos).toEqual([expect.objectContaining({ id: 99, status: "aprovado" })])
      expect((await cancel(99)).status).toBe(200)
      expect((await payments("estorno_pendente")).items.map((payment) => payment.id)).toContain(99)
    })
  })

  describe("GET /admin/eventos/:eventoId/inscricoes.csv", () => {
    it("CSV com BOM, separador ;, ordem crescente e células perigosas neutralizadas", async () => {
      getMockDb().registrations[0].nomeCompleto = "=HYPERLINK(\"x\")"
      const res = await call("GET", "/admin/eventos/1/inscricoes.csv", { headers: auth })
      expect(res.status).toBe(200)
      expect(res.headers.get("Content-Type")).toBe("text/csv; charset=utf-8")
      expect(res.headers.get("Content-Disposition")).toBe('attachment; filename="inscritos-evento-1.csv"')
      const bytes = new Uint8Array(await res.arrayBuffer())
      // BOM UTF-8 (o `res.text()` o descarta ao decodificar).
      expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf])
      const lines = new TextDecoder().decode(bytes).trimEnd().split("\r\n")
      expect(lines[0]).toBe("Código;Nome;Distância;Kit;Tamanho;Status;WhatsApp;E-mail;Nascimento;Kit retirado em")
      expect(lines).toHaveLength(25)
      expect(lines[1]).toMatch(/^VX-2026-00000001;"'=HYPERLINK\(""x""\)";5 km;Kit Camisa \+ Medalha;PP;confirmada;'\+55859\d{8};ana\.lima@exemplo\.com;01\/01\/1970;\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/)
    })

    it("filtra por status; exige sessão", async () => {
      const res = await call("GET", "/admin/eventos/1/inscricoes.csv?status=pendente", { headers: auth })
      expect((await res.text()).trimEnd().split("\r\n")).toHaveLength(4)
      expect((await call("GET", "/admin/eventos/1/inscricoes.csv")).status).toBe(401)
    })
  })

  describe("pagamentos com pendência", () => {
    it("situação é obrigatória", async () => {
      expect((await call("GET", "/admin/pagamentos", { headers: auth })).status).toBe(422)
    })

    it("cada situação com os filtros do backend, origem e ações", async () => {
      expect((await payments("em_analise")).items).toEqual([
        expect.objectContaining({ id: 20, status: "em_analise", origem: { tipo: "inscricao", inscricaoId: 20, eventoId: 1, codigo: "VX-2026-00000020" }, acoes: { conciliar: true, estornar: false } }),
      ])
      expect((await payments("divergente")).items).toEqual([
        expect.objectContaining({ id: 18, estornoMotivo: "pagamento_divergente", acoes: { conciliar: true, estornar: true } }),
      ])
      // Divergente também é estorno pendente (estorno_solicitado_em preenchido).
      expect((await payments("estorno_pendente")).items.map((payment) => [payment.id, payment.acoes])).toEqual([
        [21, { conciliar: false, estornar: true }],
        [18, { conciliar: true, estornar: true }],
      ])
    })

    it("conciliar o em análise confirma a inscrição e tira da fila", async () => {
      expect((await call("POST", "/admin/pagamentos/20/conciliar", { headers: auth })).status).toBe(204)
      expect((await detail(20)).status).toBe("confirmada")
      expect((await payments("em_analise")).items).toEqual([])
    })

    it("estornar exige motivo e só vale para estornável", async () => {
      expect((await call("POST", "/admin/pagamentos/21/estornar", { headers: auth, body: {} })).status).toBe(422)
      expect((await call("POST", "/admin/pagamentos/20/estornar", { headers: auth, body: { motivo: "x" } })).status).toBe(409)

      expect((await call("POST", "/admin/pagamentos/21/estornar", { headers: auth, body: { motivo: "Pedido do atleta" } })).status).toBe(204)
      expect((await payments("estorno_pendente")).items.map((payment) => payment.id)).toEqual([18])
      expect((await call("POST", "/admin/pagamentos/21/estornar", { headers: auth, body: { motivo: "de novo" } })).status).toBe(409)
    })

    it("estornar o aprovado de inscrição confirmada a deixa estornada", async () => {
      expect((await call("POST", "/admin/pagamentos/6/estornar", { headers: auth, body: { motivo: "Erro de cobrança" } })).status).toBe(204)
      expect((await detail(6)).status).toBe("estornada")
    })

    it("pagamento inexistente → 404 PAGAMENTO_NAO_ENCONTRADO", async () => {
      const res = await call("POST", "/admin/pagamentos/999/conciliar", { headers: auth })
      expect(res.status).toBe(404)
      expect(await errorCode(res)).toBe("PAGAMENTO_NAO_ENCONTRADO")
    })
  })
})
