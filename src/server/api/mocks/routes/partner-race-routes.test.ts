import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { AdminLoginResponse } from "@/types/api/admin-auth.interface"
import type { AdminPartnerRace, PartnerRace, PartnerRaceInput } from "@/types/api/partner-race.interface"

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

const input: PartnerRaceInput = {
  nome: "Corrida do Farol",
  dataEvento: "2027-04-18",
  localNome: "Farol do Mucuripe",
  cidade: "Fortaleza",
  uf: "ce",
  distancias: ["5 km", "10 km"],
  cupom: "VERTEX15",
  descontoPercentual: 15,
  realizacao: "",
  urlInscricao: "https://example.com/farol",
  imagemCapaUrl: null,
  ativo: true,
  ordem: 0,
}

let auth: Record<string, string>

async function publicNames(): Promise<string[]> {
  const res = await call("GET", "/corridas-parceiras")
  expect(res.status).toBe(200)
  return ((await res.json()) as PartnerRace[]).map((race) => race.nome)
}

describe("corridas parceiras no mock (contrato do módulo parceiras do backend)", () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ["Date"] })
    vi.setSystemTime(new Date("2026-11-22T12:00:00-03:00"))
    resetMockDb()
    const res = await call("POST", "/admin/auth/login", { body: { email: "admin@example.com", senha: "Vertex@Dev12345" } })
    auth = { Authorization: `Bearer ${((await res.json()) as AdminLoginResponse).accessToken}` }
  })
  afterEach(() => vi.useRealTimers())

  it("pública: só ativas de hoje em diante, por ordem, data e id; sem os campos de admin", async () => {
    const db = getMockDb()
    db.partnerRaces[0]!.ativo = false
    db.partnerRaces[1]!.dataEvento = "2026-11-21"
    db.partnerRaces.push({ ...db.partnerRaces[2]!, id: 99, nome: "Primeira pela ordem", dataEvento: "2027-12-31", ordem: -1 })

    const res = await call("GET", "/corridas-parceiras")
    const races = (await res.json()) as PartnerRace[]
    expect(races.map((race) => race.nome)).toEqual(["Primeira pela ordem", db.partnerRaces[2]!.nome])
    expect(Object.keys(races[0]!).sort()).toEqual(
      ["cidade", "cupom", "dataEvento", "descontoPercentual", "distancias", "id", "imagemCapaUrl", "localNome", "nome", "realizacao", "uf", "urlInscricao"],
    )
  })

  it("admin lista todas (inclusive inativas/passadas) por data DESC, id DESC; exige Bearer", async () => {
    expect((await call("GET", "/admin/corridas-parceiras")).status).toBe(401)
    getMockDb().partnerRaces[0]!.ativo = false
    const res = await call("GET", "/admin/corridas-parceiras", { headers: auth })
    const races = (await res.json()) as AdminPartnerRace[]
    expect(res.status).toBe(200)
    expect(races).toHaveLength(3)
    expect(races.map((race) => race.dataEvento)).toEqual([...races.map((race) => race.dataEvento)].sort().reverse())
    expect(races.find((race) => race.id === getMockDb().partnerRaces[0]!.id)).toMatchObject({ ativo: false, ordem: 0 })
    expect(Number.isNaN(Date.parse(races[0]!.criadoEm))).toBe(false)
  })

  it("cria (201 + Location), normaliza UF e realizacao vazia, audita e aparece na pública", async () => {
    const res = await call("POST", "/admin/corridas-parceiras", { body: input, headers: auth })
    const race = (await res.json()) as AdminPartnerRace
    expect(res.status).toBe(201)
    expect(res.headers.get("Location")).toBe(`/api/v1/admin/corridas-parceiras/${race.id}`)
    expect(race).toMatchObject({ nome: "Corrida do Farol", uf: "CE", realizacao: null, ativo: true, ordem: 0 })
    expect(getMockDb().audit.at(-1)).toMatchObject({ acao: "criar", entidade: "corrida_parceira", entidadeId: String(race.id) })
    expect(await publicNames()).toContain("Corrida do Farol")

    const detail = await call("GET", `/admin/corridas-parceiras/${race.id}`, { headers: auth })
    expect(((await detail.json()) as AdminPartnerRace).cupom).toBe("VERTEX15")
  })

  it("valida como o backend: objeto estrito, https, desconto 1–100, distâncias até 10", async () => {
    const invalid = [
      { ...input, extra: true },
      { ...input, urlInscricao: "http://example.com" },
      { ...input, urlInscricao: "javascript:alert(1)" },
      { ...input, imagemCapaUrl: "http://example.com/a.jpg" },
      { ...input, descontoPercentual: 0 },
      { ...input, descontoPercentual: 101 },
      { ...input, uf: "C1" },
      { ...input, dataEvento: "2027-02-30" },
      { ...input, distancias: Array.from({ length: 11 }, (_, index) => `${index} km`) },
      { ...input, ordem: 40_000 },
      { ...input, nome: "  " },
    ]
    for (const body of invalid) {
      const res = await call("POST", "/admin/corridas-parceiras", { body, headers: auth })
      expect(res.status, JSON.stringify(body).slice(0, 80)).toBe(422)
      expect(await errorCode(res)).toBe("DADO_INVALIDO")
    }
  })

  it("PATCH parcial (ativar/desativar, ordem), corpo vazio é 422 e id inexistente 404", async () => {
    const id = getMockDb().partnerRaces[0]!.id
    const res = await call("PATCH", `/admin/corridas-parceiras/${id}`, { body: { ativo: false, ordem: 3 }, headers: auth })
    expect(res.status).toBe(200)
    expect((await res.json()) as AdminPartnerRace).toMatchObject({ id, ativo: false, ordem: 3 })
    expect(getMockDb().audit.at(-1)).toMatchObject({ acao: "atualizar", entidade: "corrida_parceira" })

    expect((await call("PATCH", `/admin/corridas-parceiras/${id}`, { body: {}, headers: auth })).status).toBe(422)
    expect((await call("PATCH", "/admin/corridas-parceiras/999", { body: { ativo: true }, headers: auth })).status).toBe(404)
    expect((await call("GET", "/admin/corridas-parceiras/abc", { headers: auth })).status).toBe(422)
  })

  it("DELETE remove de vez (204) e audita; depois 404", async () => {
    const id = getMockDb().partnerRaces[0]!.id
    const res = await call("DELETE", `/admin/corridas-parceiras/${id}`, { headers: auth })
    expect(res.status).toBe(204)
    expect(getMockDb().audit.at(-1)).toMatchObject({ acao: "excluir", entidade: "corrida_parceira", entidadeId: String(id) })
    expect((await call("GET", `/admin/corridas-parceiras/${id}`, { headers: auth })).status).toBe(404)
    expect((await call("DELETE", `/admin/corridas-parceiras/${id}`, { headers: auth })).status).toBe(404)
  })
})
