import { beforeEach, describe, expect, it, vi } from "vitest"

import { ADMIN_ROLE } from "@/enums/admin-role.enum"
import { LGPD_REQUEST_STATUS } from "@/enums/lgpd-request-status.enum"
import { LGPD_REQUEST_TYPE } from "@/enums/lgpd-request-type.enum"

const mocks = vi.hoisted(() => ({
  requireAdminSession: vi.fn(),
  listAdminLgpdRequests: vi.fn(),
  updateLgpdRequestStatus: vi.fn(),
  anonymizeLgpdHolder: vi.fn(),
  revalidatePath: vi.fn(),
}))

vi.mock("next/navigation", () => ({ unstable_rethrow: () => {} }))
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }))
vi.mock("@/server/api/require-admin-session", () => ({ requireAdminSession: mocks.requireAdminSession }))
vi.mock("@/server/api/endpoints/admin-lgpd", () => ({
  listAdminLgpdRequests: mocks.listAdminLgpdRequests,
  updateLgpdRequestStatus: mocks.updateLgpdRequestStatus,
  anonymizeLgpdHolder: mocks.anonymizeLgpdHolder,
}))

const { anonymizeLgpdHolderAction, listAdminLgpdRequestsAction, updateLgpdRequestStatusAction } = await import("./admin-lgpd")
const { ApiError } = await import("@/server/api/api-error")

describe("actions de LGPD do admin", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.requireAdminSession.mockResolvedValue({ id: 1, papel: ADMIN_ROLE.ADMIN })
  })

  it("lista com os filtros; 'todos' não vai para a API", async () => {
    mocks.listAdminLgpdRequests.mockResolvedValue({ items: [], nextCursor: null })
    const response = await listAdminLgpdRequestsAction({ status: "todos", tipo: LGPD_REQUEST_TYPE.DELETION, cursor: "5" })
    expect(response).toEqual({ status: 200, data: { items: [], nextCursor: null } })
    expect(mocks.listAdminLgpdRequests).toHaveBeenCalledWith({ status: undefined, tipo: LGPD_REQUEST_TYPE.DELETION, cursor: "5" })
    expect((await listAdminLgpdRequestsAction({ status: "xyz" as never, tipo: "todos", cursor: null })).status).toBe(422)
  })

  it("muda o status com a resposta e revalida a lista e o detalhe", async () => {
    mocks.updateLgpdRequestStatus.mockResolvedValue({ id: 7 })
    const response = await updateLgpdRequestStatusAction(7, { status: LGPD_REQUEST_STATUS.FULFILLED, resposta: " Dados enviados. " })
    expect(response.status).toBe(200)
    expect(mocks.updateLgpdRequestStatus).toHaveBeenCalledWith(7, { status: "concluida", resposta: "Dados enviados." })
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/lgpd")
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/lgpd/7")
  })

  it("status sem resposta obrigatória → 422 no campo, sem chamar a API", async () => {
    const response = await updateLgpdRequestStatusAction(7, { status: LGPD_REQUEST_STATUS.REJECTED, resposta: "" })
    expect(response).toMatchObject({ status: 422, field: "resposta" })
    expect(mocks.updateLgpdRequestStatus).not.toHaveBeenCalled()
  })

  it("anonimiza e revalida; 409 vira mensagem própria", async () => {
    mocks.anonymizeLgpdHolder.mockResolvedValue(undefined)
    expect((await anonymizeLgpdHolderAction(7)).status).toBe(204)
    expect(mocks.anonymizeLgpdHolder).toHaveBeenCalledWith(7)

    mocks.anonymizeLgpdHolder.mockRejectedValue(new ApiError(409, "CONFLITO_DE_ESTADO", "já anonimizado"))
    const conflict = await anonymizeLgpdHolderAction(7)
    expect(conflict).toMatchObject({ status: 409, error: "Os dados deste titular já foram anonimizados ou não há cadastro dele para anonimizar." })
    expect((await anonymizeLgpdHolderAction(0)).status).toBe(422)
  })

  it("sem sessão: o redirect do requireAdminSession sobe", async () => {
    mocks.requireAdminSession.mockRejectedValue(new Error("NEXT_REDIRECT"))
    await expect(anonymizeLgpdHolderAction(7)).rejects.toThrow("NEXT_REDIRECT")
    expect(mocks.anonymizeLgpdHolder).not.toHaveBeenCalled()
  })
})
