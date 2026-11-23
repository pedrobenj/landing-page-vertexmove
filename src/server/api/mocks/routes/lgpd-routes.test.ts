import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { AdminLoginResponse } from "@/types/api/admin-auth.interface"
import type { CursorPage } from "@/types/api/cursor-page.interface"
import type {
  AdminLgpdRequest,
  AdminLgpdRequestSummary,
  LgpdRequestInput,
  LgpdRequestReceipt,
} from "@/types/api/lgpd-request.interface"

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

const unknownHolder: LgpdRequestInput = {
  tipo: "acesso" as LgpdRequestInput["tipo"],
  nomeCompleto: "Pessoa Sem Cadastro",
  cpf: "52998224725",
  email: "pessoa@example.com",
  whatsapp: null,
  mensagem: null,
}

let auth: Record<string, string>

async function open(input: LgpdRequestInput): Promise<LgpdRequestReceipt> {
  const res = await call("POST", "/lgpd/solicitacoes", { body: input })
  expect(res.status).toBe(202)
  return (await res.json()) as LgpdRequestReceipt
}

async function idOf(protocolo: string): Promise<number> {
  const res = await call("GET", "/admin/lgpd/solicitacoes?limit=100", { headers: auth })
  const page = (await res.json()) as CursorPage<AdminLgpdRequestSummary>
  const item = page.items.find((entry) => entry.protocolo === protocolo)
  if (!item) throw new Error(`protocolo ${protocolo} não listado`)
  return item.id
}

describe("solicitações do titular (LGPD) no mock", () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ["Date"] })
    vi.setSystemTime(new Date("2026-11-23T10:00:00-03:00"))
    resetMockDb()
    const res = await call("POST", "/admin/auth/login", { body: { email: "admin@example.com", senha: "Vertex@Dev12345" } })
    auth = { Authorization: `Bearer ${((await res.json()) as AdminLoginResponse).accessToken}` }
  })
  afterEach(() => vi.useRealTimers())

  it("pública: 202 com protocolo e prazo de 15 dias, igual exista ou não o titular", async () => {
    const athlete = getMockDb().registrations.find((registration) => registration.cpf !== null)!
    const known = await open({ ...unknownHolder, nomeCompleto: athlete.nomeCompleto, cpf: athlete.cpf! })
    const unknown = await open(unknownHolder)

    expect(Object.keys(known).sort()).toEqual(["prazoEm", "protocolo"])
    expect(Object.keys(unknown).sort()).toEqual(["prazoEm", "protocolo"])
    expect(known.protocolo).toMatch(/^LGPD-2026-[0-9A-Z]{8}$/)
    expect(unknown.protocolo).not.toBe(known.protocolo)
    expect(new Date(known.prazoEm).getTime() - Date.now()).toBe(15 * 24 * 60 * 60 * 1000)
  })

  it("pública: valida o corpo (objeto estrito, CPF, contato obrigatório)", async () => {
    const invalid = [
      { ...unknownHolder, cpf: "11111111111" },
      { ...unknownHolder, email: null, whatsapp: null },
      { ...unknownHolder, tipo: "outro" },
      { ...unknownHolder, extra: true },
    ]
    for (const body of invalid) {
      const res = await call("POST", "/lgpd/solicitacoes", { body })
      expect(res.status).toBe(422)
      expect(await errorCode(res)).toBe("DADO_INVALIDO")
    }
  })

  it("admin: lista sem PII (nome mascarado), mais recentes primeiro, com filtros de status e tipo", async () => {
    const first = await open(unknownHolder)
    vi.setSystemTime(new Date("2026-11-23T10:05:00-03:00"))
    const second = await open({ ...unknownHolder, tipo: "eliminacao" as LgpdRequestInput["tipo"] })

    const res = await call("GET", "/admin/lgpd/solicitacoes", { headers: auth })
    expect(res.status).toBe(200)
    const page = (await res.json()) as CursorPage<AdminLgpdRequestSummary>
    expect(page.items.map((item) => item.protocolo).slice(0, 2)).toEqual([second.protocolo, first.protocolo])
    expect(page.items[0]).not.toHaveProperty("cpf")
    expect(page.items[0]).not.toHaveProperty("email")
    expect(page.items[0]!.nomeMascarado).toBe("Pessoa C****")

    const byType = (await (await call("GET", "/admin/lgpd/solicitacoes?tipo=eliminacao", { headers: auth })).json()) as CursorPage<AdminLgpdRequestSummary>
    expect(byType.items.every((item) => item.tipo === "eliminacao")).toBe(true)
    expect(byType.items.map((item) => item.protocolo)).toContain(second.protocolo)

    const byStatus = (await (await call("GET", "/admin/lgpd/solicitacoes?status=concluida", { headers: auth })).json()) as CursorPage<AdminLgpdRequestSummary>
    expect(byStatus.items.every((item) => item.status === "concluida")).toBe(true)

    expect((await call("GET", "/admin/lgpd/solicitacoes?status=xyz", { headers: auth })).status).toBe(422)
    expect((await call("GET", "/admin/lgpd/solicitacoes")).status).toBe(401)
  })

  it("admin: detalhe com PII e auditoria de acesso; 404 e 422 para id inexistente/inválido", async () => {
    const receipt = await open(unknownHolder)
    const id = await idOf(receipt.protocolo)

    const res = await call("GET", `/admin/lgpd/solicitacoes/${id}`, { headers: auth })
    expect(res.status).toBe(200)
    const detail = (await res.json()) as AdminLgpdRequest
    expect(detail).toMatchObject({ protocolo: receipt.protocolo, cpf: "52998224725", email: "pessoa@example.com", status: "aberta", titularEncontrado: false })
    expect(getMockDb().audit.at(-1)).toMatchObject({ acao: "visualizar_pii", entidade: "solicitacao_titular", entidadeId: String(id) })

    expect((await call("GET", "/admin/lgpd/solicitacoes/9999", { headers: auth })).status).toBe(404)
    expect((await call("GET", "/admin/lgpd/solicitacoes/abc", { headers: auth })).status).toBe(422)
  })

  it("admin: muda o status; concluída/recusada exigem resposta e marcam respondidoEm", async () => {
    const id = await idOf((await open(unknownHolder)).protocolo)
    const path = `/admin/lgpd/solicitacoes/${id}/status`

    const progress = await call("POST", path, { body: { status: "em_andamento", resposta: null }, headers: auth })
    expect(progress.status).toBe(200)
    expect((await progress.json()) as AdminLgpdRequest).toMatchObject({ status: "em_andamento", respondidoEm: null })

    const noAnswer = await call("POST", path, { body: { status: "concluida", resposta: " " }, headers: auth })
    expect(noAnswer.status).toBe(422)

    const done = await call("POST", path, { body: { status: "concluida", resposta: "Dados enviados por e-mail." }, headers: auth })
    expect(done.status).toBe(200)
    expect((await done.json()) as AdminLgpdRequest).toMatchObject({ status: "concluida", resposta: "Dados enviados por e-mail.", respondidoEm: expect.any(String) })
    expect(getMockDb().audit.at(-1)).toMatchObject({ acao: "atualizar", entidade: "solicitacao_titular" })
  })

  it("admin: exporta os dados do titular em JSON (anexo) e audita", async () => {
    const athlete = getMockDb().registrations.find((registration) => registration.cpf !== null)!
    const id = await idOf((await open({ ...unknownHolder, cpf: athlete.cpf! })).protocolo)

    const res = await call("GET", `/admin/lgpd/solicitacoes/${id}/exportacao`, { headers: auth })
    expect(res.status).toBe(200)
    expect(res.headers.get("Content-Type")).toContain("application/json")
    expect(res.headers.get("Content-Disposition")).toMatch(/^attachment; filename="titular-LGPD-2026-[0-9A-Z]{8}\.json"$/)
    // `exportar_dados_titular` (migration 0021): nunca devolve CPF.
    const body = (await res.json()) as { atletas: { nomeCompleto: string }[]; inscricoes: unknown[]; pedidos: unknown[]; aceites: unknown[] }
    expect(body.atletas[0]?.nomeCompleto).toBe(athlete.nomeCompleto)
    expect(body.inscricoes.length).toBeGreaterThan(0)
    expect(body).toHaveProperty("pedidos")
    expect(body).toHaveProperty("aceites")
    expect(JSON.stringify(body)).not.toContain(athlete.cpf!)
    expect(getMockDb().audit.at(-1)).toMatchObject({ acao: "exportar", entidade: "solicitacao_titular" })
  })

  it("admin: anonimiza o titular (irreversível); repetir ou sem titular → 409", async () => {
    const athlete = getMockDb().registrations.find((registration) => registration.cpf !== null)!
    const id = await idOf((await open({ ...unknownHolder, cpf: athlete.cpf! })).protocolo)
    const path = `/admin/lgpd/solicitacoes/${id}/anonimizar`

    expect((await call("POST", path, { headers: auth })).status).toBe(204)
    const anonymized = getMockDb().registrations.filter((registration) => registration.id === athlete.id)[0]!
    expect(anonymized).toMatchObject({ nomeCompleto: "Titular anonimizado", cpf: null, whatsapp: null, email: null })
    const detail = (await (await call("GET", `/admin/lgpd/solicitacoes/${id}`, { headers: auth })).json()) as AdminLgpdRequest
    expect(detail.anonimizadoEm).toEqual(expect.any(String))
    expect(getMockDb().audit.some((entry) => entry.acao === "anonimizar")).toBe(true)

    const again = await call("POST", path, { headers: auth })
    expect(again.status).toBe(409)
    expect(await errorCode(again)).toBe("CONFLITO_DE_ESTADO")

    const orphan = await idOf((await open(unknownHolder)).protocolo)
    expect((await call("POST", `/admin/lgpd/solicitacoes/${orphan}/anonimizar`, { headers: auth })).status).toBe(409)
  })
})
