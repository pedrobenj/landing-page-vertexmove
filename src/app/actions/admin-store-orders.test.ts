import { beforeEach, describe, expect, it, vi } from "vitest"

import { ADMIN_ROLE } from "@/enums/admin-role.enum"
import { ORDER_STATUS } from "@/enums/order-status.enum"
import { STORE_ORDER_ACTION } from "@/enums/store-order-action.enum"
import { ApiError } from "@/server/api/api-error"

const mocks = vi.hoisted(() => ({
  listAdminStoreOrders: vi.fn(),
  runStoreOrderAction: vi.fn(),
  requireAdminSession: vi.fn(),
  revalidatePath: vi.fn(),
}))

vi.mock("next/navigation", () => ({ unstable_rethrow: () => {} }))
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }))
vi.mock("@/server/api/require-admin-session", () => ({ requireAdminSession: mocks.requireAdminSession }))
vi.mock("@/server/api/endpoints/store-orders", () => ({
  listAdminStoreOrders: mocks.listAdminStoreOrders,
  runStoreOrderAction: mocks.runStoreOrderAction,
}))

const { listAdminStoreOrdersAction, runStoreOrderActionAction } = await import("./admin-store-orders")

const CODE = "VTX-P-7K3PQ-M9X2D"

describe("admin-store-orders actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.requireAdminSession.mockResolvedValue({ id: 1, papel: ADMIN_ROLE.ADMIN })
  })

  it("lista com o filtro e o cursor (\"todos\" não vai à API)", async () => {
    mocks.listAdminStoreOrders.mockResolvedValue({ items: [], nextCursor: null })
    expect(await listAdminStoreOrdersAction({ status: "todos", cursor: null })).toEqual({ status: 200, data: { items: [], nextCursor: null } })
    expect(mocks.listAdminStoreOrders).toHaveBeenLastCalledWith({ status: undefined, cursor: undefined })
    await listAdminStoreOrdersAction({ status: ORDER_STATUS.PAID, cursor: CODE })
    expect(mocks.listAdminStoreOrders).toHaveBeenLastCalledWith({ status: ORDER_STATUS.PAID, cursor: CODE })
  })

  it("filtro inválido → 422 sem chamar a API", async () => {
    expect(await listAdminStoreOrdersAction({ status: "PAGO" as never, cursor: null })).toMatchObject({ status: 422 })
    expect(mocks.listAdminStoreOrders).not.toHaveBeenCalled()
  })

  it("executa a ação e revalida o admin e a loja (cancelar devolve estoque)", async () => {
    const response = await runStoreOrderActionAction(CODE, STORE_ORDER_ACTION.CANCEL)
    expect(response).toEqual({ status: 204 })
    expect(mocks.runStoreOrderAction).toHaveBeenCalledWith(CODE, STORE_ORDER_ACTION.CANCEL)
    expect(mocks.revalidatePath.mock.calls).toEqual([["/admin/loja/pedidos"], [`/admin/loja/pedidos/${CODE}`], ["/loja", "layout"]])
  })

  it("código ou ação inválidos → 422", async () => {
    expect(await runStoreOrderActionAction("x", STORE_ORDER_ACTION.CANCEL)).toMatchObject({ status: 422 })
    expect(await runStoreOrderActionAction(CODE, "apagar" as never)).toMatchObject({ status: 422 })
    expect(mocks.runStoreOrderAction).not.toHaveBeenCalled()
  })

  it("papel sem permissão → 403", async () => {
    mocks.requireAdminSession.mockResolvedValue({ id: 2, papel: "visitante" })
    expect(await runStoreOrderActionAction(CODE, STORE_ORDER_ACTION.READY)).toMatchObject({ status: 403, code: "ACESSO_NEGADO" })
  })

  it("transição recusada pela API (409) vira mensagem", async () => {
    mocks.runStoreOrderAction.mockRejectedValue(new ApiError(409, "CONFLITO_DE_ESTADO", "x"))
    expect(await runStoreOrderActionAction(CODE, STORE_ORDER_ACTION.READY)).toMatchObject({
      status: 409,
      code: "CONFLITO_DE_ESTADO",
      title: "Não foi possível alterar o pedido",
    })
  })
})
