import { beforeEach, describe, expect, it, vi } from "vitest"

import { CART_ISSUE_REASON } from "@/enums/cart-issue-reason.enum"
import { ApiError } from "@/server/api/api-error"

const mocks = vi.hoisted(() => ({
  createStoreOrder: vi.fn(),
  priceCart: vi.fn(),
  saveStoreOrderAccess: vi.fn(),
  revalidatePath: vi.fn(),
}))

vi.mock("next/navigation", () => ({ unstable_rethrow: () => {} }))
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }))
vi.mock("@/server/api/endpoints/store", () => ({ createStoreOrder: mocks.createStoreOrder, priceCart: mocks.priceCart }))
vi.mock("@/server/api/store-order-access", () => ({ saveStoreOrderAccess: mocks.saveStoreOrderAccess }))

const { createOrderAction, validateCartAction } = await import("./store")

const input = {
  name: "Maria Silva",
  cpf: "529.982.247-25",
  whatsapp: "(85) 98888-7777",
  email: "M@X.com",
  acceptPrivacy: true as const,
  items: [{ variantId: "101", quantity: 1 }],
}

describe("createOrderAction", () => {
  beforeEach(() => vi.clearAllMocks())

  it("guarda o token do pedido em cookie e não o devolve ao navegador", async () => {
    mocks.createStoreOrder.mockResolvedValue({ ok: true, code: "VTX-P-AAAAA-BBBBB", accessToken: "segredo", expiresAt: "2026-11-21T12:30:00Z" })
    const response = await createOrderAction(input)
    expect(mocks.saveStoreOrderAccess).toHaveBeenCalledWith("VTX-P-AAAAA-BBBBB", "segredo", "2026-11-21T12:30:00Z")
    expect(response).toMatchObject({ status: 201, data: { code: "VTX-P-AAAAA-BBBBB" } })
    expect(JSON.stringify(response)).not.toContain("segredo")
  })

  it("carrinho alterado → 409 com os avisos e a primeira mensagem", async () => {
    const issue = { variantId: "101", reason: CART_ISSUE_REASON.INSUFFICIENT_STOCK, availableQuantity: 0, message: "Um item do seu carrinho esgotou" }
    mocks.createStoreOrder.mockResolvedValue({ ok: false, cart: { lines: [], issues: [issue], total: 0, itemCount: 0 } })
    const response = await createOrderAction(input)
    expect(response).toMatchObject({ status: 409, code: "CARRINHO_ALTERADO", error: issue.message, data: { issues: [issue] } })
    expect(mocks.saveStoreOrderAccess).not.toHaveBeenCalled()
  })

  it("erro da API vira HttpResponse com a mensagem do código", async () => {
    mocks.createStoreOrder.mockRejectedValue(new ApiError(429, "LIMITE_EXCEDIDO", "x"))
    expect(await createOrderAction(input)).toMatchObject({ status: 429, code: "LIMITE_EXCEDIDO" })
  })
})

describe("validateCartAction", () => {
  it("carrinho inválido não chega à API", async () => {
    const response = await validateCartAction([])
    expect(response.status).toBe(422)
    expect(mocks.priceCart).not.toHaveBeenCalled()
  })
})
