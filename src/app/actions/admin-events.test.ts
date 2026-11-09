import { beforeEach, describe, expect, it, vi } from "vitest"

import { EVENT_STATUS } from "@/enums/event-status.enum"
import { ApiError } from "@/server/api/api-error"

const mocks = vi.hoisted(() => ({
  listAdminEvents: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  unstable_rethrow: (error: unknown) => {
    if (error instanceof Error && error.message.startsWith("REDIRECT:")) throw error
  },
}))
vi.mock("@/server/api/endpoints/admin-events", () => ({ listAdminEvents: mocks.listAdminEvents }))

const { listAdminEventsAction } = await import("./admin-events")

describe("listAdminEventsAction", () => {
  beforeEach(() => vi.clearAllMocks())

  it("todos → sem filtro de status; cursor nulo → primeira página", async () => {
    mocks.listAdminEvents.mockResolvedValue({ items: [], nextCursor: null })
    const response = await listAdminEventsAction({ status: "todos", cursor: null })
    expect(response).toEqual({ status: 200, data: { items: [], nextCursor: null } })
    expect(mocks.listAdminEvents).toHaveBeenCalledWith({ status: undefined, cursor: undefined })
  })

  it("repassa status e cursor", async () => {
    mocks.listAdminEvents.mockResolvedValue({ items: [], nextCursor: null })
    await listAdminEventsAction({ status: EVENT_STATUS.DRAFT, cursor: "10" })
    expect(mocks.listAdminEvents).toHaveBeenCalledWith({ status: EVENT_STATUS.DRAFT, cursor: "10" })
  })

  it("status inválido → 422 sem chamar a API", async () => {
    // @ts-expect-error status fora do enum
    const response = await listAdminEventsAction({ status: "qualquer", cursor: null })
    expect(response.status).toBe(422)
    expect(mocks.listAdminEvents).not.toHaveBeenCalled()
  })

  it("403 da API → mensagem de permissão", async () => {
    mocks.listAdminEvents.mockRejectedValue(new ApiError(403, "ACESSO_NEGADO", "Proibido"))
    const response = await listAdminEventsAction({ status: "todos", cursor: null })
    expect(response).toMatchObject({ status: 403, code: "ACESSO_NEGADO", error: "Você não tem permissão para realizar esta ação." })
  })

  it("relança o redirect do adminFetch (sessão expirada)", async () => {
    mocks.listAdminEvents.mockRejectedValue(new Error("REDIRECT:/admin/login"))
    await expect(listAdminEventsAction({ status: "todos", cursor: null })).rejects.toThrow("REDIRECT:/admin/login")
  })
})
