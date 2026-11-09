import { beforeEach, describe, expect, it, vi } from "vitest"

import type { Transport } from "../transport"

// "use cache" é só uma string para o Vitest: aqui se testa a lógica das funções e o
// contrato de erro (CachedResult → ApiError relançado fora do cache), não o cache do Next.
const mockEnv = vi.hoisted(() => ({ NODE_ENV: "test", API_URL: "http://api.test", API_TIMEOUT_MS: 5_000, USE_MOCK_API: true }))
const cache = vi.hoisted(() => ({ cacheTag: vi.fn(), cacheLife: vi.fn() }))
const override = vi.hoisted(() => ({ transport: null as Transport | null }))

vi.mock("@/lib/env", () => ({ env: mockEnv }))
vi.mock("next/cache", () => cache)
vi.mock("next/headers", () => ({ headers: async () => new Headers() }))
vi.mock("../transport", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../transport")>()
  return { getTransport: async () => override.transport ?? actual.getTransport() }
})

const { getPublicEvent, listPastEvents, listPublicEvents } = await import("./events")
const { listPartnerRaces } = await import("./partner-races")
const { ApiError, isApiError } = await import("../api-error")
const { resetMockDb } = await import("../mocks/mock-db")

function respondWith(status: number, codigo: string): Transport {
  return async () => Response.json({ error: { codigo, mensagem: "erro" } }, { status })
}

async function catchError(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise
  } catch (error) {
    return error
  }
  throw new Error("esperava que a promise rejeitasse")
}

describe("endpoints de eventos (contra o mock)", () => {
  beforeEach(() => {
    resetMockDb()
    override.transport = null
    cache.cacheTag.mockClear()
    cache.cacheLife.mockClear()
  })

  it("lista as corridas publicadas", async () => {
    const page = await listPublicEvents()

    expect(page.items).toHaveLength(3)
    expect(cache.cacheTag).toHaveBeenCalledWith("events")
    expect(cache.cacheLife).toHaveBeenCalledWith({ stale: 60, revalidate: 60, expire: 300 })
  })

  it("busca o detalhe com as tags do evento", async () => {
    const detail = await getPublicEvent("corrida-vertex-beira-mar-2026")

    expect(detail.nome).toBe("Corrida Vertex Beira-Mar 2026")
    expect(cache.cacheTag).toHaveBeenCalledWith("events", "event:corrida-vertex-beira-mar-2026")
  })

  it("relança 404 como ApiError com status e código", async () => {
    const error = await catchError(getPublicEvent("corrida-de-natal-vertex-2026"))

    expect(error).toBeInstanceOf(ApiError)
    expect(isApiError(error)).toBe(true)
    expect(error).toMatchObject({ status: 404, codigo: "NAO_ENCONTRADO" })
    expect(cache.cacheLife).toHaveBeenCalledWith({ stale: 60, revalidate: 60, expire: 300 })
  })

  it("lista corridas encerradas e parceiras", async () => {
    expect((await listPastEvents()).items).toHaveLength(4)
    expect(await listPartnerRaces()).toHaveLength(3)
    expect(cache.cacheTag).toHaveBeenCalledWith("partner-races")
  })

  it("trata 404 das rotas propostas como lista vazia", async () => {
    override.transport = respondWith(404, "NAO_ENCONTRADO")

    expect(await listPastEvents()).toEqual({ items: [], nextCursor: null })
    expect(await listPartnerRaces()).toEqual([])
  })

  it("relança falha transitória como ApiError e cacheia só por segundos", async () => {
    override.transport = respondWith(503, "INDISPONIVEL")

    expect(await catchError(listPartnerRaces())).toMatchObject({ status: 503, codigo: "INDISPONIVEL" })
    expect(await catchError(listPublicEvents())).toMatchObject({ status: 503 })
    expect(cache.cacheLife).toHaveBeenCalledWith("seconds")
    expect(cache.cacheLife).not.toHaveBeenCalledWith({ stale: 60, revalidate: 60, expire: 300 })
  })
})
