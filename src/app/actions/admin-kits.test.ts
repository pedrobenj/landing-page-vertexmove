import { beforeEach, describe, expect, it, vi } from "vitest"

import { ADMIN_ROLE } from "@/enums/admin-role.enum"
import type { KitFormInput } from "@/lib/validations/kit.schema"

const mocks = vi.hoisted(() => ({
  requireAdminSession: vi.fn(),
  getAdminEvent: vi.fn(),
  listKits: vi.fn(),
  createKit: vi.fn(),
  updateKit: vi.fn(),
  updateTag: vi.fn(),
}))

vi.mock("next/navigation", () => ({ unstable_rethrow: () => {} }))
vi.mock("next/cache", () => ({ updateTag: mocks.updateTag }))
vi.mock("@/server/api/require-admin-session", () => ({ requireAdminSession: mocks.requireAdminSession }))
vi.mock("@/server/api/endpoints/admin-events", () => ({ getAdminEvent: mocks.getAdminEvent }))
vi.mock("@/server/api/endpoints/distances", () => ({ listDistances: vi.fn() }))
vi.mock("@/server/api/endpoints/price-tiers", () => ({ listPriceTiers: vi.fn() }))
vi.mock("@/server/api/endpoints/kits", () => ({ listKits: mocks.listKits, createKit: mocks.createKit, updateKit: mocks.updateKit }))

const { createKitAction, updateKitAction } = await import("./admin-kits")

const kit: KitFormInput = {
  nome: "Kit completo",
  descricao: "",
  precoCentavos: "50,00",
  ativo: true,
  fotos: [{ url: "https://cdn.example.com/kit.jpg", alt: "Camisa" }],
}

describe("admin kits actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.requireAdminSession.mockResolvedValue({ id: 1, papel: ADMIN_ROLE.SUPER_ADMIN })
    mocks.getAdminEvent.mockResolvedValue({ id: 4, slug: "corrida-x" })
    mocks.listKits.mockResolvedValue([{ id: 7 }])
  })

  it("cria kit com fotos e revalida a página pública", async () => {
    mocks.createKit.mockResolvedValue({ id: 8 })
    const response = await createKitAction(4, kit)
    expect(response.status).toBe(201)
    expect(mocks.createKit).toHaveBeenCalledWith(4, expect.objectContaining({ fotos: [expect.objectContaining({ ordem: 1 })] }))
    expect(mocks.updateTag.mock.calls.map(([tag]) => tag)).toEqual(["event:corrida-x"])
  })

  it("foto inválida → 422 com o caminho do campo", async () => {
    const response = await createKitAction(4, { ...kit, fotos: [{ url: "kit.jpg", alt: "A" }] })
    expect(response).toMatchObject({ status: 422, field: "fotos.0.url" })
  })

  it("kit de outra corrida → 404", async () => {
    const response = await updateKitAction(4, 99, kit)
    expect(response.status).toBe(404)
    expect(mocks.updateKit).not.toHaveBeenCalled()
  })

  it("operador → 403", async () => {
    mocks.requireAdminSession.mockResolvedValue({ id: 2, papel: ADMIN_ROLE.OPERATOR })
    expect((await updateKitAction(4, 7, kit)).status).toBe(403)
  })
})
