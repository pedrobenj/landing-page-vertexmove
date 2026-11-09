import { beforeEach, describe, expect, it, vi } from "vitest"

import { ADMIN_ROLE } from "@/enums/admin-role.enum"
import type { DistanceFormInput } from "@/lib/validations/distance.schema"
import type { PriceTierFormInput } from "@/lib/validations/price-tier.schema"
import { ApiError } from "@/server/api/api-error"

const mocks = vi.hoisted(() => ({
  requireAdminSession: vi.fn(),
  getAdminEvent: vi.fn(),
  listDistances: vi.fn(),
  createDistance: vi.fn(),
  updateDistance: vi.fn(),
  listPriceTiers: vi.fn(),
  createPriceTier: vi.fn(),
  updatePriceTier: vi.fn(),
  updateTag: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  unstable_rethrow: (error: unknown) => {
    if (error instanceof Error && error.message.startsWith("REDIRECT:")) throw error
  },
}))
vi.mock("next/cache", () => ({ updateTag: mocks.updateTag }))
vi.mock("@/server/api/require-admin-session", () => ({ requireAdminSession: mocks.requireAdminSession }))
vi.mock("@/server/api/endpoints/admin-events", () => ({ getAdminEvent: mocks.getAdminEvent }))
vi.mock("@/server/api/endpoints/kits", () => ({ listKits: vi.fn() }))
vi.mock("@/server/api/endpoints/distances", () => ({
  listDistances: mocks.listDistances,
  createDistance: mocks.createDistance,
  updateDistance: mocks.updateDistance,
}))
vi.mock("@/server/api/endpoints/price-tiers", () => ({
  listPriceTiers: mocks.listPriceTiers,
  createPriceTier: mocks.createPriceTier,
  updatePriceTier: mocks.updatePriceTier,
}))

const { createDistanceAction, createPriceTierAction, updateDistanceAction, updatePriceTierAction } = await import("./admin-distances")

const distance: DistanceFormInput = {
  nome: "5 km",
  descricao: "",
  distanciaMetros: "5000",
  capacidadeTotal: "400",
  horarioLargada: "",
  percursoUrl: "",
  ordem: "1",
  ativo: true,
}
const tier: PriceTierFormInput = {
  nome: "1º lote",
  precoCentavos: "89,90",
  inicioEm: "2026-11-01T00:00",
  fimEm: "2026-11-30T23:59",
  quantidadeTotal: "",
  ordem: "1",
  ativo: true,
}
const tags = () => mocks.updateTag.mock.calls.map(([tag]) => tag)

describe("admin distances actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.requireAdminSession.mockResolvedValue({ id: 1, papel: ADMIN_ROLE.ORGANIZATION })
    mocks.getAdminEvent.mockResolvedValue({ id: 4, slug: "corrida-x" })
    mocks.listDistances.mockResolvedValue([{ id: 12 }])
    mocks.listPriceTiers.mockResolvedValue([{ id: 30 }])
  })

  it("cria distância no formato da API e revalida o slug lido do servidor", async () => {
    mocks.createDistance.mockResolvedValue({ id: 13 })
    const response = await createDistanceAction(4, distance)
    expect(response.status).toBe(201)
    expect(mocks.createDistance).toHaveBeenCalledWith(4, expect.objectContaining({ distanciaMetros: 5000, descricao: null }))
    expect(tags()).toEqual(["events", "event:corrida-x"])
  })

  it("operador → 403", async () => {
    mocks.requireAdminSession.mockResolvedValue({ id: 2, papel: ADMIN_ROLE.OPERATOR })
    expect((await createDistanceAction(4, distance)).status).toBe(403)
    expect(mocks.createDistance).not.toHaveBeenCalled()
  })

  it("editar distância de outra corrida → 404 sem PATCH", async () => {
    const response = await updateDistanceAction(4, 99, distance)
    expect(response.status).toBe(404)
    expect(mocks.updateDistance).not.toHaveBeenCalled()
    expect(mocks.updateTag).not.toHaveBeenCalled()
  })

  it("cria lote com centavos e ISO -03:00", async () => {
    mocks.createPriceTier.mockResolvedValue({ id: 31 })
    const response = await createPriceTierAction(4, 12, tier)
    expect(response.status).toBe(201)
    expect(mocks.createPriceTier).toHaveBeenCalledWith(
      12,
      expect.objectContaining({ precoCentavos: 8990, inicioEm: "2026-11-01T00:00:00-03:00", quantidadeTotal: null }),
    )
  })

  it("lote com fim antes do início → 422 no campo fimEm", async () => {
    const response = await createPriceTierAction(4, 12, { ...tier, fimEm: "2026-10-01T00:00" })
    expect(response).toMatchObject({ status: 422, field: "fimEm" })
  })

  it("editar lote de outra distância → 404", async () => {
    const response = await updatePriceTierAction(4, 12, 77, tier)
    expect(response.status).toBe(404)
    expect(mocks.updatePriceTier).not.toHaveBeenCalled()
  })

  it("edita lote da distância certa", async () => {
    mocks.updatePriceTier.mockResolvedValue({ id: 30 })
    const response = await updatePriceTierAction(4, 12, 30, tier)
    expect(response.status).toBe(200)
    expect(tags()).toEqual(["events", "event:corrida-x"])
  })

  it("422 da API com campo é repassado", async () => {
    mocks.createPriceTier.mockRejectedValue(new ApiError(422, "DADO_INVALIDO", "fimEm: fimEm deve ser depois de inicioEm."))
    const response = await createPriceTierAction(4, 12, tier)
    expect(response).toMatchObject({ status: 422, field: "fimEm" })
  })
})
