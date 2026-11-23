import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { REGISTRATION_STATUS } from "@/enums/registration-status.enum"
import type { AdminLoginResponse } from "@/types/api/admin-auth.interface"
import type { CursorPage } from "@/types/api/cursor-page.interface"
import type {
  AdminLgpdRequest,
  AdminLgpdRequestStatus,
  AdminLgpdRequestSummary,
  LgpdAnonymizationResult,
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
  nome: "Pessoa Sem Cadastro",
  cpf: "52998224725",
  email: "pessoa@example.com",
  aceite: true,
}
const deletion = "eliminacao" as LgpdRequestInput["tipo"]

let auth: Record<string, string>

async function open(input: LgpdRequestInput): Promise<LgpdRequestReceipt> {
  const res = await call("POST", "/lgpd/solicitacoes", { body: input })
  expect(res.status).toBe(201)
  return (await res.json()) as LgpdRequestReceipt
}

async function idOf(protocolo: string): Promise<number> {
  const res = await call("GET", "/admin/lgpd/solicitacoes?limit=100", { headers: auth })
  const page = (await res.json()) as CursorPage<AdminLgpdRequestSummary>
  const item = page.items.find((entry) => entry.protocolo === protocolo)
  if (!item) throw new Error(`protocolo ${protocolo} não listado`)
  return item.id
}

/** Atleta do seed com CPF e sem inscrição pendente (a anonimização recusa pendências). */
function settledAthlete() {
  const registrations = getMockDb().registrations
  return registrations.find(
    (registration) =>
      registration.cpf !== null &&
      registrations.every((other) => other.cpf !== registration.cpf || other.status !== REGISTRATION_STATUS.PENDING),
  )!
}

describe("solicitações do titular (LGPD) no mock — contrato do módulo lgpd do backend", () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ["Date"] })
    vi.setSystemTime(new Date("2026-11-23T10:00:00-03:00"))
    resetMockDb()
    const res = await call("POST", "/admin/auth/login", { body: { email: "admin@example.com", senha: "Vertex@Dev12345" } })
    auth = { Authorization: `Bearer ${((await res.json()) as AdminLoginResponse).accessToken}` }
  })
  afterEach(() => vi.useRealTimers())

  it("pública: 201 com protocolo opaco, status e prazo de 15 dias, igual exista ou não o CPF", async () => {
    const athlete = settledAthlete()
    const known = await open({ ...unknownHolder, nome: athlete.nomeCompleto, cpf: athlete.cpf! })
    const unknown = await open(unknownHolder)

    expect(Object.keys(known).sort()).toEqual(["prazoEm", "protocolo", "status"])
    expect(Object.keys(unknown).sort()).toEqual(["prazoEm", "protocolo", "status"])
    expect(known.status).toBe("aberta")
    expect(known.protocolo).toMatch(/^LGPD-2026-[2-9A-HJ-NP-Z]{8}$/)
    expect(unknown.protocolo).not.toBe(known.protocolo)
    expect(new Date(known.prazoEm).getTime() - Date.now()).toBe(15 * 24 * 60 * 60 * 1000)
  })

  it("pública: valida o corpo (estrito, aceite literal, CPF, contato; null não é aceito)", async () => {
    const invalid = [
      { ...unknownHolder, cpf: "11111111111" },
      { ...unknownHolder, email: undefined },
      { ...unknownHolder, email: null },
      { ...unknownHolder, tipo: "outro" },
      { ...unknownHolder, aceite: false },
      { ...unknownHolder, extra: true },
    ]
    for (const body of invalid) {
      const res = await call("POST", "/lgpd/solicitacoes", { body })
      expect(res.status).toBe(422)
      expect(await errorCode(res)).toBe("DADO_INVALIDO")
    }
  })

  it("admin: lista sem PII (nome mascarado), mais recentes primeiro, com filtros e 'vencida'", async () => {
    const first = await open(unknownHolder)
    vi.setSystemTime(new Date("2026-11-23T10:05:00-03:00"))
    const second = await open({ ...unknownHolder, tipo: deletion })

    const res = await call("GET", "/admin/lgpd/solicitacoes", { headers: auth })
    expect(res.status).toBe(200)
    const page = (await res.json()) as CursorPage<AdminLgpdRequestSummary>
    expect(page.items.map((item) => item.protocolo).slice(0, 2)).toEqual([second.protocolo, first.protocolo])
    expect(Object.keys(page.items[0]!).sort()).toEqual(
      ["anonimizadaEm", "atualizadoEm", "criadoEm", "id", "nomeMascarado", "prazoEm", "protocolo", "status", "tipo", "vencida"].sort(),
    )
    expect(page.items[0]).toMatchObject({ nomeMascarado: "Pessoa C.", vencida: false })

    const byType = (await (await call("GET", "/admin/lgpd/solicitacoes?tipo=eliminacao", { headers: auth })).json()) as CursorPage<AdminLgpdRequestSummary>
    expect(byType.items.every((item) => item.tipo === "eliminacao")).toBe(true)
    expect(byType.items.map((item) => item.protocolo)).toContain(second.protocolo)

    const byStatus = (await (await call("GET", "/admin/lgpd/solicitacoes?status=concluida", { headers: auth })).json()) as CursorPage<AdminLgpdRequestSummary>
    expect(byStatus.items.every((item) => item.status === "concluida")).toBe(true)

    expect((await call("GET", "/admin/lgpd/solicitacoes?status=xyz", { headers: auth })).status).toBe(422)
    expect((await call("GET", "/admin/lgpd/solicitacoes?outro=1", { headers: auth })).status).toBe(422)
    expect((await call("GET", "/admin/lgpd/solicitacoes")).status).toBe(401)
  })

  it("admin: detalhe com o requerente (CPF mascarado) e auditoria; 404/422 por id", async () => {
    const receipt = await open({ ...unknownHolder, mensagem: "Quais dados?" })
    const id = await idOf(receipt.protocolo)

    const res = await call("GET", `/admin/lgpd/solicitacoes/${id}`, { headers: auth })
    expect(res.status).toBe(200)
    const detail = (await res.json()) as AdminLgpdRequest
    expect(detail).toMatchObject({
      protocolo: receipt.protocolo,
      nome: "Pessoa Sem Cadastro",
      cpfMascarado: "***.982.247-**",
      email: "pessoa@example.com",
      whatsapp: null,
      mensagem: "Quais dados?",
      status: "aberta",
      resposta: null,
      encerradaEm: null,
      atualizadoPor: null,
    })
    expect(detail).not.toHaveProperty("cpf")
    expect(getMockDb().audit.at(-1)).toMatchObject({ acao: "visualizar_pii", entidade: "solicitacao_titular", entidadeId: String(id) })

    expect((await call("GET", "/admin/lgpd/solicitacoes/9999", { headers: auth })).status).toBe(404)
    expect((await call("GET", "/admin/lgpd/solicitacoes/abc", { headers: auth })).status).toBe(422)
  })

  it("admin: PATCH muda o status; final exige resposta, é definitivo e marca encerradaEm", async () => {
    const id = await idOf((await open(unknownHolder)).protocolo)
    const path = `/admin/lgpd/solicitacoes/${id}`

    const progress = await call("PATCH", path, { body: { status: "em_andamento" }, headers: auth })
    expect(progress.status).toBe(200)
    expect((await progress.json()) as AdminLgpdRequestStatus).toMatchObject({ status: "em_andamento", encerradaEm: null, resposta: null })

    expect((await call("PATCH", path, { body: { status: "concluida" }, headers: auth })).status).toBe(422)
    expect((await call("PATCH", path, { body: { status: "concluida", resposta: null }, headers: auth })).status).toBe(422)
    const back = await call("PATCH", path, { body: { status: "aberta" }, headers: auth })
    expect(back.status).toBe(409)
    expect(await errorCode(back)).toBe("CONFLITO_DE_ESTADO")

    const done = await call("PATCH", path, { body: { status: "concluida", resposta: "Dados enviados por e-mail." }, headers: auth })
    expect(done.status).toBe(200)
    expect((await done.json()) as AdminLgpdRequestStatus).toMatchObject({
      status: "concluida",
      resposta: "Dados enviados por e-mail.",
      encerradaEm: expect.any(String),
    })
    expect(getMockDb().audit.at(-1)).toMatchObject({ acao: "atualizar", entidade: "solicitacao_titular" })
    expect((await call("PATCH", path, { body: { status: "recusada", resposta: "x" }, headers: auth })).status).toBe(409)
  })

  it("admin: POST exportar devolve o JSON do titular (sem CPF) como anexo e audita", async () => {
    const athlete = settledAthlete()
    const receipt = await open({ ...unknownHolder, cpf: athlete.cpf! })
    const id = await idOf(receipt.protocolo)

    const res = await call("POST", `/admin/lgpd/solicitacoes/${id}/exportar`, { headers: auth })
    expect(res.status).toBe(200)
    expect(res.headers.get("Content-Type")).toContain("application/json")
    expect(res.headers.get("Content-Disposition")).toBe(`attachment; filename="lgpd-${receipt.protocolo}.json"`)
    const body = (await res.json()) as {
      protocolo: string
      geradoEm: string
      titular: { atletas: { id: number; nomeCompleto: string }[]; inscricoes: unknown[]; pedidos: unknown[]; aceites: unknown[] }
    }
    expect(body).toMatchObject({ protocolo: receipt.protocolo, geradoEm: expect.any(String) })
    expect(body.titular.atletas[0]?.nomeCompleto).toBe(athlete.nomeCompleto)
    expect(body.titular.inscricoes.length).toBeGreaterThan(0)
    expect(body.titular).toHaveProperty("pedidos")
    expect(body.titular).toHaveProperty("aceites")
    expect(JSON.stringify(body)).not.toContain(athlete.cpf!)
    expect(getMockDb().audit.at(-1)).toMatchObject({ acao: "exportar", entidade: "solicitacao_titular" })
  })

  it("admin: anonimiza só eliminação, com confirmar: true; idempotente; pendência → 409", async () => {
    const athlete = settledAthlete()
    const id = await idOf((await open({ ...unknownHolder, tipo: deletion, cpf: athlete.cpf! })).protocolo)
    const path = `/admin/lgpd/solicitacoes/${id}/anonimizar`

    expect((await call("POST", path, { body: {}, headers: auth })).status).toBe(422)
    const res = await call("POST", path, { body: { confirmar: true }, headers: auth })
    expect(res.status).toBe(200)
    const result = (await res.json()) as LgpdAnonymizationResult
    expect(result).toMatchObject({ anonimizadaEm: expect.any(String), atletas: 1, pedidos: 0 })
    expect(result.inscricoes).toBeGreaterThan(0)
    expect(getMockDb().registrations.find((registration) => registration.id === athlete.id)).toMatchObject({
      nomeCompleto: "Titular anonimizado",
      whatsapp: null,
      email: null,
    })
    const detail = (await (await call("GET", `/admin/lgpd/solicitacoes/${id}`, { headers: auth })).json()) as AdminLgpdRequest
    expect(detail.anonimizadaEm).toEqual(expect.any(String))
    expect(getMockDb().audit.some((entry) => entry.acao === "anonimizar")).toBe(true)

    const again = await call("POST", path, { body: { confirmar: true }, headers: auth })
    expect(again.status).toBe(200)
    expect((await again.json()) as LgpdAnonymizationResult).toMatchObject({ atletas: 0, inscricoes: 0 })

    const access = await idOf((await open({ ...unknownHolder, cpf: athlete.cpf! })).protocolo)
    const notDeletion = await call("POST", `/admin/lgpd/solicitacoes/${access}/anonimizar`, { body: { confirmar: true }, headers: auth })
    expect(notDeletion.status).toBe(409)

    const pending = getMockDb().registrations.find((registration) => registration.cpf !== null && registration.status === REGISTRATION_STATUS.PENDING)!
    const blocked = await idOf((await open({ ...unknownHolder, tipo: deletion, cpf: pending.cpf! })).protocolo)
    const conflict = await call("POST", `/admin/lgpd/solicitacoes/${blocked}/anonimizar`, { body: { confirmar: true }, headers: auth })
    expect(conflict.status).toBe(409)
    expect(await errorCode(conflict)).toBe("CONFLITO_DE_ESTADO")
  })
})
