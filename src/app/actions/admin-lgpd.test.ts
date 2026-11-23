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
    expect(response).toMatchObject({ status: 200, data: { id: 7 } })
    expect(mocks.updateLgpdRequestStatus).toHaveBeenCalledWith(7, { status: "concluida", resposta: "Dados enviados." })
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/lgpd")
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/lgpd/7")
  })

  it("status sem resposta obrigatória → 422 no campo, sem chamar a API", async () => {
    const response = await updateLgpdRequestStatusAction(7, { status: LGPD_REQUEST_STATUS.REJECTED, resposta: "" })
    expect(response).toMatchObject({ status: 422, field: "resposta" })
    expect(mocks.updateLgpdRequestStatus).not.toHaveBeenCalled()
  })

  it("status que já mudou (409) → aviso para recarregar", async () => {
    mocks.updateLgpdRequestStatus.mockRejectedValue(new ApiError(409, "CONFLITO_DE_ESTADO", "A solicitação não pode passar de concluida para recusada."))
    const response = await updateLgpdRequestStatusAction(7, { status: LGPD_REQUEST_STATUS.REJECTED, resposta: "Não." })
    expect(response).toMatchObject({ status: 409, error: "Esta solicitação já foi encerrada ou mudou de status. Recarregue a página." })
  })

  it("anonimiza com confirmar: true, devolve as contagens e revalida", async () => {
    const result = { protocolo: "LGPD-2026-ABCDEFGH", anonimizadaEm: "2026-11-23T13:00:00.000Z", atletas: 1, inscricoes: 2, pedidos: 0, notificacoes: 1 }
    mocks.anonymizeLgpdHolder.mockResolvedValue(result)
    const response = await anonymizeLgpdHolderAction(7)
    expect(response).toMatchObject({ status: 200, data: result })
    expect(mocks.anonymizeLgpdHolder).toHaveBeenCalledWith(7)
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/lgpd/7")
    expect((await anonymizeLgpdHolderAction(0)).status).toBe(422)
  })

  it("anonimização recusada (409/retenção legal) mostra o motivo do backend", async () => {
    mocks.anonymizeLgpdHolder.mockRejectedValue(
      new ApiError(409, "CONFLITO_DE_ESTADO", "O titular tem inscrição ou pedido aguardando pagamento. Aguarde a expiração ou cancele antes de anonimizar."),
    )
    expect(await anonymizeLgpdHolderAction(7)).toMatchObject({ status: 409, error: expect.stringContaining("aguardando pagamento") })

    mocks.anonymizeLgpdHolder.mockRejectedValue(new ApiError(409, "RETENCAO_LEGAL_ATIVA", "O titular ainda está dentro do prazo de retenção legal."))
    expect(await anonymizeLgpdHolderAction(7)).toMatchObject({ status: 409, error: "O titular ainda está dentro do prazo de retenção legal: os dados não podem ser apagados agora." })
  })

  it("sem sessão: o redirect do requireAdminSession sobe", async () => {
    mocks.requireAdminSession.mockRejectedValue(new Error("NEXT_REDIRECT"))
    await expect(anonymizeLgpdHolderAction(7)).rejects.toThrow("NEXT_REDIRECT")
    expect(mocks.anonymizeLgpdHolder).not.toHaveBeenCalled()
  })
})
