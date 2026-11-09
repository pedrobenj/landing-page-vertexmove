import { describe, expect, it, vi } from "vitest"

const mockEnv = vi.hoisted(() => ({ USE_MOCK_API: true }))
vi.mock("@/lib/env", () => ({ env: mockEnv }))

const { getPartners } = await import("./partners")
const { getCommunityStats } = await import("./community-stats")

describe("conteúdo estático", () => {
  it("devolve dados de demonstração no modo mock", () => {
    mockEnv.USE_MOCK_API = true
    expect(getPartners()).toHaveLength(6)
    expect(getPartners().every((partner) => partner.logoUrl === null)).toBe(true)
    expect(getCommunityStats()).toHaveLength(4)
  })

  it("sem mock, devolve as listas reais (vazias até o cliente enviar)", () => {
    mockEnv.USE_MOCK_API = false
    expect(getPartners()).toEqual([])
    expect(getCommunityStats()).toBeNull()
  })
})
