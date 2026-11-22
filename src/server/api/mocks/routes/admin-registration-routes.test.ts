import { beforeEach, describe, expect, it } from "vitest"

import type { AdminLoginResponse } from "@/types/api/admin-auth.interface"
import type { ApiAdminPayment } from "@/types/api/admin-payment.interface"
import type { ApiAdminRegistration, ApiAdminRegistrationDetails } from "@/types/api/admin-registration.interface"
import type { CursorPage } from "@/types/api/cursor-page.interface"

import { resetMockDb } from "../mock-db"
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

async function payments(query = ""): Promise<CursorPage<ApiAdminPayment>> {
  const res = await call("GET", `/admin/pagamentos${query}`, { headers: auth })
  expect(res.status).toBe(200)
  return (await res.json()) as CursorPage<ApiAdminPayment>
}

describe("rotas admin de inscrições e pagamentos no mock (fase 5)", () => {
  beforeEach(async () => {
    resetMockDb()
    const res = await call("POST", "/admin/auth/login", { body: { email: "admin@example.com", senha: "Vertex@Dev12345" } })
    auth = { Authorization: `Bearer ${((await res.json()) as AdminLoginResponse).accessToken}` }
  })

  describe("GET /admin/eventos/:eventoId/inscricoes", () => {
    it("exige sessão", async () => {
      expect((await call("GET", "/admin/eventos/1/inscricoes")).status).toBe(401)
    })

    it("pagina por cursor, mais recentes primeiro, com CPF mascarado e sem contato", async () => {
      const first = await list()
      expect(first.items).toHaveLength(20)
      expect(first.nextCursor).not.toBeNull()
      expect(first.items[0].codigo).toBe("VX-2026-00000024")
      const item = first.items.find((registration) => registration.cpfMascarado !== null)!
      expect(item.cpfMascarado).toMatch(/^\*\*\*\.\d{3}\.\d{3}-\*\*$/)
      expect(Object.keys(item).sort()).toEqual(
        [
          "codigo",
          "cpfMascarado",
          "distancia",
          "id",
          "inscritoEm",
          "kit",
          "kitRetiradoEm",
          "nomeCompleto",
          "pagamento",
          "status",
          "tamanhoCamisa",
          "valorTotalCentavos",
        ].sort(),
      )

      const second = await list(`?cursor=${first.nextCursor}`)
      expect(second.items).toHaveLength(4)
      expect(second.nextCursor).toBeNull()
    })

    it("filtra por status, distância e busca (nome sem acento ou código)", async () => {
      expect((await list("?status=pendente")).items.map((item) => item.status)).toEqual(["pendente", "pendente"])
      const tenK = await list("?distanciaId=2")
      expect(tenK.items.length).toBeGreaterThan(0)
      expect(tenK.items.every((item) => item.distancia === "10 km")).toBe(true)
      expect((await list("?busca=joao")).items.map((item) => item.nomeCompleto)).toEqual(["João Victor Holanda"])
      expect((await list("?busca=00000003")).items.map((item) => item.codigo)).toEqual(["VX-2026-00000003"])
    })

    it("corrida sem inscritos → lista vazia; inexistente → 404", async () => {
      const res = await call("GET", "/admin/eventos/2/inscricoes", { headers: auth })
      expect(await res.json()).toEqual({ items: [], nextCursor: null })
      expect((await call("GET", "/admin/eventos/999/inscricoes", { headers: auth })).status).toBe(404)
    })

    it("status inválido → 422", async () => {
      const res = await call("GET", "/admin/eventos/1/inscricoes?status=paga", { headers: auth })
      expect(res.status).toBe(422)
    })
  })

  describe("GET /admin/inscricoes/:id", () => {
    it("traz contato, nascimento, aceites, histórico e pagamentos", async () => {
      const registration = await detail(1)
      expect(registration).toMatchObject({
        id: 1,
        codigo: "VX-2026-00000001",
        eventoId: 1,
        evento: "Corrida Vertex Beira-Mar 2026",
        status: "confirmada",
        nomeCompleto: "Ana Beatriz Lima",
        email: "ana.lima@exemplo.com",
      })
      expect(registration.whatsapp).toMatch(/^\+55\d{11}$/)
      expect(registration.dataNascimento).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(registration.aceites.map((acceptance) => acceptance.tipo)).toEqual(["regulamento", "termo_responsabilidade"])
      expect(registration.historico.map((change) => change.status)).toEqual(["pendente", "confirmada"])
      expect(registration.pagamentos).toEqual([expect.objectContaining({ id: 1, status: "aprovado" })])
    })

    it("inexistente → 404", async () => {
      expect((await call("GET", "/admin/inscricoes/999", { headers: auth })).status).toBe(404)
    })
  })

  describe("retirada de kit", () => {
    it("marca (idempotente) e desfaz", async () => {
      const path = "/admin/inscricoes/4/retirada-kit"
      expect((await call("POST", path, { headers: auth })).status).toBe(204)
      const marked = (await detail(4)).kitRetiradoEm
      expect(marked).not.toBeNull()
      expect((await call("POST", path, { headers: auth })).status).toBe(204)
      expect((await detail(4)).kitRetiradoEm).toBe(marked)

      expect((await call("DELETE", path, { headers: auth })).status).toBe(204)
      expect((await detail(4)).kitRetiradoEm).toBeNull()
    })

    it("só inscrição confirmada → senão 409", async () => {
      const res = await call("POST", "/admin/inscricoes/19/retirada-kit", { headers: auth })
      expect(res.status).toBe(409)
      expect(await errorCode(res)).toBe("CONFLITO_DE_ESTADO")
    })
  })

  describe("POST /admin/inscricoes/:id/cancelar", () => {
    it("confirmada com pagamento aprovado → cancelada e estorno sinalizado na fila", async () => {
      expect((await call("POST", "/admin/inscricoes/5/cancelar", { headers: auth })).status).toBe(204)
      expect((await detail(5)).status).toBe("cancelada")
      const refunds = await payments("?situacao=estorno_pendente")
      expect(refunds.items.map((payment) => payment.id)).toContain(5)
    })

    it("já cancelada → 409", async () => {
      const res = await call("POST", "/admin/inscricoes/21/cancelar", { headers: auth })
      expect(res.status).toBe(409)
    })
  })

  describe("GET /admin/eventos/:eventoId/inscricoes.csv", () => {
    it("CSV com BOM, separador ; e células perigosas neutralizadas", async () => {
      const db = (await import("../mock-db")).getMockDb()
      db.registrations[0].nomeCompleto = "=HYPERLINK(\"x\")"
      const res = await call("GET", "/admin/eventos/1/inscricoes.csv", { headers: auth })
      expect(res.status).toBe(200)
      expect(res.headers.get("Content-Type")).toBe("text/csv; charset=utf-8")
      expect(res.headers.get("Content-Disposition")).toContain("attachment")
      const bytes = new Uint8Array(await res.arrayBuffer())
      // BOM UTF-8 (o `res.text()` o descarta ao decodificar).
      expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf])
      const text = new TextDecoder().decode(bytes)
      const lines = text.trimEnd().split("\r\n")
      expect(lines[0]).toBe("Código;Nome;Distância;Kit;Tamanho;Status;WhatsApp;E-mail;Nascimento;Retirada")
      expect(lines).toHaveLength(25)
      expect(text).toContain(`"'=HYPERLINK(""x"")"`)
    })

    it("exige sessão", async () => {
      expect((await call("GET", "/admin/eventos/1/inscricoes.csv")).status).toBe(401)
    })
  })

  describe("pagamentos com pendência", () => {
    it("lista as três situações e filtra por uma", async () => {
      const all = await payments()
      expect(all.items.map((payment) => payment.situacao).sort()).toEqual(["divergente", "em_analise", "estorno_pendente"])
      const review = await payments("?situacao=em_analise")
      expect(review.items).toEqual([
        expect.objectContaining({ id: 20, status: "em_analise", inscricao: { id: 20, codigo: "VX-2026-00000020", eventoId: 1 }, pedidoLoja: null }),
      ])
    })

    it("conciliar o em análise confirma a inscrição e tira da fila", async () => {
      expect((await call("POST", "/admin/pagamentos/20/conciliar", { headers: auth })).status).toBe(204)
      expect((await detail(20)).status).toBe("confirmada")
      expect((await payments("?situacao=em_analise")).items).toEqual([])
    })

    it("estornar exige motivo e só vale para aprovado", async () => {
      expect((await call("POST", "/admin/pagamentos/18/estornar", { headers: auth, body: {} })).status).toBe(422)
      expect((await call("POST", "/admin/pagamentos/20/estornar", { headers: auth, body: { motivo: "x" } })).status).toBe(409)

      const res = await call("POST", "/admin/pagamentos/18/estornar", { headers: auth, body: { motivo: "Valor divergente" } })
      expect(res.status).toBe(204)
      expect((await detail(18)).status).toBe("estornada")
      expect((await payments("?situacao=divergente")).items).toEqual([])
    })

    it("pagamento inexistente → 404 PAGAMENTO_NAO_ENCONTRADO", async () => {
      const res = await call("POST", "/admin/pagamentos/999/conciliar", { headers: auth })
      expect(res.status).toBe(404)
      expect(await errorCode(res)).toBe("PAGAMENTO_NAO_ENCONTRADO")
    })
  })
})
