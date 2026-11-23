import { beforeEach, describe, expect, it, vi } from "vitest"

import type { CursorPage } from "@/types/api/cursor-page.interface"
import type { PublicEvent } from "@/types/api/event.interface"

const mockEnv = vi.hoisted(() => ({ NODE_ENV: "test", API_URL: "http://api.test", API_TIMEOUT_MS: 5_000, USE_MOCK_API: true }))

vi.mock("@/lib/env", () => ({ env: mockEnv }))
vi.mock("next/cache", () => ({ cacheTag: vi.fn(), cacheLife: vi.fn() }))
vi.mock("next/headers", () => ({ headers: async () => new Headers() }))

const { loadMorePastEventsAction } = await import("./past-events")
const { resetMockDb } = await import("@/server/api/mocks/mock-db")
const { mockFetch } = await import("@/server/api/mocks/mock-fetch")

async function firstPageOfTwo(): Promise<CursorPage<PublicEvent>> {
  const response = await mockFetch("http://api.test/api/v1/eventos/encerrados?limit=2", {})
  return (await response.json()) as CursorPage<PublicEvent>
}

describe("loadMorePastEventsAction", () => {
  beforeEach(() => resetMockDb())

  it("devolve a página seguinte a partir do cursor", async () => {
    const first = await firstPageOfTwo()
    expect(first.nextCursor).not.toBeNull()

    const response = await loadMorePastEventsAction(first.nextCursor ?? "")

    expect(response.status).toBe(200)
    expect(response.data?.items).toHaveLength(2)
    expect(response.data?.nextCursor).toBeNull()
    const slugs = response.data?.items.map((event) => event.slug) ?? []
    expect(slugs).not.toContain(first.items[0].slug)
  })

  it("cursor vazio ou longo demais → 422 sem chamar a API", async () => {
    expect((await loadMorePastEventsAction("")).status).toBe(422)
    expect((await loadMorePastEventsAction("a".repeat(600))).status).toBe(422)
  })

  it("cursor recusado pela API → erro com mensagem amigável", async () => {
    const response = await loadMorePastEventsAction("999999")
    expect(response.status).toBe(422)
    expect(response.error).toBeTruthy()
    expect(response.title).toBe("Não foi possível carregar mais corridas")
  })
})
