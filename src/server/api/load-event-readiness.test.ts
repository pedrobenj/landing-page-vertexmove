import { beforeEach, describe, expect, it, vi } from "vitest"

import { DOCUMENT_TYPE } from "@/enums/document-type.enum"

const mocks = vi.hoisted(() => ({ listDistances: vi.fn(), listDocuments: vi.fn(), listPriceTiers: vi.fn() }))

vi.mock("./endpoints/distances", () => ({ listDistances: mocks.listDistances }))
vi.mock("./endpoints/documents", () => ({ listDocuments: mocks.listDocuments }))
vi.mock("./endpoints/price-tiers", () => ({ listPriceTiers: mocks.listPriceTiers }))

const { loadEventReadiness } = await import("./load-event-readiness")

const NOW = new Date("2026-11-14T12:00:00-03:00")
const OPEN_TIER = { inicioEm: "2026-11-01T00:00:00-03:00", fimEm: null, ativo: true }

describe("loadEventReadiness", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    mocks.listDistances.mockReset()
    mocks.listDocuments.mockReset()
    mocks.listPriceTiers.mockReset()
  })

  it("busca lotes só das distâncias ativas e monta o checklist", async () => {
    mocks.listDistances.mockResolvedValue([
      { id: 1, ativo: true },
      { id: 2, ativo: false },
    ])
    mocks.listPriceTiers.mockResolvedValue([OPEN_TIER])
    mocks.listDocuments.mockResolvedValue([{ tipo: DOCUMENT_TYPE.REGULATION, vigenteEm: "2026-11-01T00:00:00-03:00" }])

    await expect(loadEventReadiness(7, NOW)).resolves.toEqual({ readiness: { ready: false, missing: ["termo"] } })
    expect(mocks.listPriceTiers).toHaveBeenCalledTimes(1)
    expect(mocks.listPriceTiers).toHaveBeenCalledWith(1)
  })

  it("falha da API vira erro só desta corrida", async () => {
    mocks.listDistances.mockRejectedValue(new Error("boom"))
    mocks.listDocuments.mockResolvedValue([])
    await expect(loadEventReadiness(7, NOW)).resolves.toEqual({ error: true })
  })
})
