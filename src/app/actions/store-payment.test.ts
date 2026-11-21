import { beforeEach, describe, expect, it, vi } from "vitest"

import { API_ERROR_CODE } from "@/enums/api-error-code.enum"
import { ORDER_STATUS } from "@/enums/order-status.enum"
import { ApiError } from "@/server/api/api-error"

const mockEnv = vi.hoisted(() => ({ NODE_ENV: "test", USE_MOCK_API: false }))
const mocks = vi.hoisted(() => ({
  getStoreOrderAccessToken: vi.fn<(codigo: string) => Promise<string | null>>(),
  createStoreOrderCheckout: vi.fn(),
  simulateMockStorePayment: vi.fn(),
  getStoreOrder: vi.fn(),
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`)
  }),
}))

vi.mock("@/lib/env", () => ({ env: mockEnv }))
vi.mock("next/navigation", () => ({ redirect: mocks.redirect, unstable_rethrow: () => {} }))
vi.mock("@/server/api/store-order-access", () => ({ getStoreOrderAccessToken: mocks.getStoreOrderAccessToken }))
vi.mock("@/server/api/endpoints/store-payment", () => ({
  createStoreOrderCheckout: mocks.createStoreOrderCheckout,
  simulateMockStorePayment: mocks.simulateMockStorePayment,
}))
vi.mock("@/server/api/endpoints/store", () => ({ getStoreOrder: mocks.getStoreOrder }))

const { getStoreOrderStatusAction, simulateMockStorePaymentAction, startStoreCheckoutAction } = await import("./store-payment")

const CODE = "VTX-P-7K3PQ-M9X2D"

describe("store-payment actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEnv.USE_MOCK_API = false
    mocks.getStoreOrderAccessToken.mockResolvedValue("tok")
  })

  it("código fora do formato → 404 sem chamar a API", async () => {
    expect(await startStoreCheckoutAction("qualquer")).toMatchObject({ status: 404, code: API_ERROR_CODE.NOT_FOUND })
    expect(await getStoreOrderStatusAction("qualquer")).toMatchObject({ status: 404 })
    expect(mocks.createStoreOrderCheckout).not.toHaveBeenCalled()
    expect(mocks.getStoreOrder).not.toHaveBeenCalled()
  })

  it("sem o cookie do pedido, devolve 401 com orientação", async () => {
    mocks.getStoreOrderAccessToken.mockResolvedValue(null)
    const response = await startStoreCheckoutAction(CODE)
    expect(response).toMatchObject({ status: 401, code: API_ERROR_CODE.NOT_AUTHENTICATED })
    expect(response.error).toContain("mesmo aparelho")
    expect(mocks.createStoreOrderCheckout).not.toHaveBeenCalled()
  })

  it("devolve só o checkoutUrl do Mercado Pago, com o token do cookie", async () => {
    mocks.createStoreOrderCheckout.mockResolvedValue({ checkoutUrl: "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=1" })
    const response = await startStoreCheckoutAction(CODE)
    expect(mocks.createStoreOrderCheckout).toHaveBeenCalledWith(CODE, "tok")
    expect(response).toEqual({ status: 201, data: { checkoutUrl: "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=1" } })
  })

  it.each([null, "https://evil.example/checkout", "/dev/checkout-pro/VTX-P-7K3PQ-M9X2D"])("recusa checkoutUrl %j fora do Mercado Pago", async (checkoutUrl) => {
    mocks.createStoreOrderCheckout.mockResolvedValue({ checkoutUrl })
    expect(await startStoreCheckoutAction(CODE)).toMatchObject({ status: 502, code: API_ERROR_CODE.INVALID_CHECKOUT_URL })
  })

  it("no mock aceita o checkout falso local", async () => {
    mockEnv.USE_MOCK_API = true
    mocks.createStoreOrderCheckout.mockResolvedValue({ checkoutUrl: `/dev/checkout-pro/${CODE}` })
    expect(await startStoreCheckoutAction(CODE)).toMatchObject({ status: 201 })
  })

  it("pedido expirado (409 PEDIDO_EXPIRADO) vira mensagem amigável", async () => {
    mocks.createStoreOrderCheckout.mockRejectedValue(new ApiError(409, "PEDIDO_EXPIRADO", "expirou"))
    const response = await startStoreCheckoutAction(CODE)
    expect(response).toMatchObject({ status: 409, code: "PEDIDO_EXPIRADO", error: expect.stringContaining("prazo para pagar este pedido") })
  })

  it("status do pedido para o polling: só o status, sem token", async () => {
    mocks.getStoreOrder.mockResolvedValue({ code: CODE, status: ORDER_STATUS.PAID, buyerFirstName: "Maria" })
    expect(await getStoreOrderStatusAction(CODE)).toEqual({ status: 200, data: { status: ORDER_STATUS.PAID } })
    expect(mocks.getStoreOrderAccessToken).not.toHaveBeenCalled()
  })

  it("checkout falso só funciona no mock e volta para o pedido como o retorno do backend", async () => {
    await simulateMockStorePaymentAction(CODE, "aprovado" as never)
    expect(mocks.simulateMockStorePayment).not.toHaveBeenCalled()

    mockEnv.USE_MOCK_API = true
    await expect(simulateMockStorePaymentAction(CODE, "aprovado" as never)).rejects.toThrow(`REDIRECT:/pedido/${CODE}?pagamento=sucesso`)
    expect(mocks.simulateMockStorePayment).toHaveBeenCalledWith(CODE, "aprovado")
    await expect(simulateMockStorePaymentAction(CODE, "recusado" as never)).rejects.toThrow(`REDIRECT:/pedido/${CODE}?pagamento=falha`)
  })
})
