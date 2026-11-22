import { beforeEach, describe, expect, it, vi } from "vitest"

import { ADMIN_ROLE } from "@/enums/admin-role.enum"
import { PAYMENT_ISSUE } from "@/enums/payment-issue.enum"
import { ApiError } from "@/server/api/api-error"

const mocks = vi.hoisted(() => ({
  listAdminPayments: vi.fn(),
  reconcilePayment: vi.fn(),
  refundPayment: vi.fn(),
  requireAdminSession: vi.fn(),
  revalidatePath: vi.fn(),
}))

vi.mock("next/navigation", () => ({ unstable_rethrow: () => {} }))
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }))
vi.mock("@/server/api/require-admin-session", () => ({ requireAdminSession: mocks.requireAdminSession }))
vi.mock("@/server/api/endpoints/admin-payments", () => ({
  listAdminPayments: mocks.listAdminPayments,
  reconcilePayment: mocks.reconcilePayment,
  refundPayment: mocks.refundPayment,
}))

const { listAdminPaymentsAction, reconcilePaymentAction, refundPaymentAction } = await import("./admin-payments")

describe("admin-payments actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.requireAdminSession.mockResolvedValue({ id: 1, papel: ADMIN_ROLE.ADMIN })
  })

  it("lista com a situação (obrigatória na API) e o cursor", async () => {
    mocks.listAdminPayments.mockResolvedValue({ items: [], nextCursor: null })
    expect(await listAdminPaymentsAction({ situacao: PAYMENT_ISSUE.UNDER_REVIEW, cursor: null })).toEqual({ status: 200, data: { items: [], nextCursor: null } })
    expect(mocks.listAdminPayments).toHaveBeenLastCalledWith({ situacao: "em_analise", cursor: undefined })
    await listAdminPaymentsAction({ situacao: PAYMENT_ISSUE.REFUND_PENDING, cursor: "9" })
    expect(mocks.listAdminPayments).toHaveBeenLastCalledWith({ situacao: "estorno_pendente", cursor: "9" })
  })

  it("situação inválida → 422", async () => {
    expect(await listAdminPaymentsAction({ situacao: "aprovado" as never, cursor: null })).toMatchObject({ status: 422 })
    expect(await listAdminPaymentsAction({ situacao: "todas" as never, cursor: null })).toMatchObject({ status: 422 })
    expect(mocks.listAdminPayments).not.toHaveBeenCalled()
  })

  it("concilia e revalida a fila e as inscrições", async () => {
    expect(await reconcilePaymentAction(5)).toEqual({ status: 204 })
    expect(mocks.reconcilePayment).toHaveBeenCalledWith(5)
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/pagamentos")
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/eventos", "layout")
  })

  it("estorna com o motivo aparado", async () => {
    expect(await refundPaymentAction(5, "  Atleta desistiu  ")).toEqual({ status: 204 })
    expect(mocks.refundPayment).toHaveBeenCalledWith(5, "Atleta desistiu")
  })

  it("estorno sem motivo ou com motivo longo → 422 no campo motivo", async () => {
    expect(await refundPaymentAction(5, "   ")).toMatchObject({ status: 422, field: "motivo" })
    expect(await refundPaymentAction(5, "x".repeat(501))).toMatchObject({ status: 422, field: "motivo" })
    expect(mocks.refundPayment).not.toHaveBeenCalled()
  })

  it("estado que não permite estorno (409) e pagamento sumido (404) viram mensagem", async () => {
    mocks.refundPayment.mockRejectedValue(new ApiError(409, "CONFLITO_DE_ESTADO", "x"))
    expect(await refundPaymentAction(5, "ok")).toMatchObject({ status: 409, title: "Não foi possível estornar o pagamento" })
    mocks.reconcilePayment.mockRejectedValue(new ApiError(404, "PAGAMENTO_NAO_ENCONTRADO", "x"))
    expect(await reconcilePaymentAction(5)).toMatchObject({ status: 404, error: "Pagamento não encontrado. Recarregue a página." })
  })

  it("papel só leitura → 403 sem chamar a API", async () => {
    mocks.requireAdminSession.mockResolvedValue({ id: 2, papel: ADMIN_ROLE.OPERATOR })
    expect(await reconcilePaymentAction(5)).toMatchObject({ status: 403 })
    expect(await refundPaymentAction(5, "ok")).toMatchObject({ status: 403 })
    expect(mocks.reconcilePayment).not.toHaveBeenCalled()
    expect(mocks.refundPayment).not.toHaveBeenCalled()
  })
})
