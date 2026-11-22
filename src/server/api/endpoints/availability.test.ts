import { beforeEach, describe, expect, it, vi } from "vitest"

import type { Transport } from "../transport"

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

const { getEventAvailability, getPublicEventWithAvailability } = await import("./availability")
const { resetMockDb } = await import("../mocks/mock-db")

function respondWith(status: number): Transport {
  return async () => Response.json({ error: { codigo: "X", mensagem: "erro" } }, { status })
}

describe("disponibilidade do evento (contra o mock)", () => {
  beforeEach(() => {
    resetMockDb()
    override.transport = null
    cache.cacheTag.mockClear()
    vi.spyOn(console, "error").mockImplementation(() => {})
  })

  it("devolve lote vigente e esgotado por distância, sem cache", async () => {
    const availability = await getEventAvailability("night-run-vertex-aterro")

    expect(availability?.eventoSlug).toBe("night-run-vertex-aterro")
    expect(availability?.distancias.length).toBeGreaterThan(0)
    expect(availability?.distancias.some((item) => item.esgotado)).toBe(true)
    expect(cache.cacheTag).not.toHaveBeenCalled()
  })

  it("chama a rota sem cache com o slug codificado", async () => {
    const calls: Array<{ url: string; init: RequestInit }> = []
    override.transport = async (url, init) => {
      calls.push({ url, init })
      return Response.json({ eventoSlug: "a b", calculadoEm: "2026-11-12T12:00:00-03:00", distancias: [] })
    }
    await getEventAvailability("a b")
    expect(calls[0]?.url).toBe("http://api.test/api/v1/eventos/a%20b/disponibilidade")
    expect(calls[0]?.init.cache).toBe("no-store")
  })

  it.each([404, 429, 503])("falha %i vira null (a página cai no cálculo local)", async (status) => {
    override.transport = respondWith(status)
    expect(await getEventAvailability("corrida-vertex-beira-mar-2026")).toBeNull()
  })

  it("combina o detalhe com a disponibilidade", async () => {
    const event = await getPublicEventWithAvailability("night-run-vertex-aterro")
    const tenKm = event.distancias?.find((distance) => distance.nome === "10 km")
    expect(tenKm?.esgotado).toBe(true)
    expect(tenKm?.loteVigente).not.toBeUndefined()
  })
})
