import { beforeEach, describe, expect, it, vi } from "vitest"

import { API_ERROR_CODE } from "@/enums/api-error-code.enum"
import { PAYMENT_STATUS } from "@/enums/payment-status.enum"

const mockEnv = vi.hoisted(() => ({ NODE_ENV: "test", API_URL: "http://api.test", API_TIMEOUT_MS: 5_000, USE_MOCK_API: false }))
const getRegistrationAccessToken = vi.hoisted(() => vi.fn<(codigo: string) => Promise<string | null>>())
const getRegistrationDetails = vi.hoisted(() => vi.fn())
const createRegistrationCheckout = vi.hoisted(() => vi.fn())

vi.mock("@/lib/env", () => ({ env: mockEnv }))
vi.mock("next/headers", () => ({ headers: async () => new Headers() }))
vi.mock("@/server/api/registration-access", () => ({ getRegistrationAccessToken }))
vi.mock("@/server/api/endpoints/registration-payment", () => ({
  getRegistrationDetails,
  createRegistrationCheckout,
  simulateMockPayment: vi.fn(),
}))

const { getRegistrationDetailsAction, startRegistrationCheckoutAction } = await import("./registration-payment")

const CODE = "VX-2026-00000042"

describe("registration-payment actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getRegistrationAccessToken.mockResolvedValue("tok")
  })

  it("sem o cookie da inscrição, devolve 401 sem chamar a API", async () => {
    getRegistrationAccessToken.mockResolvedValue(null)
    const details = await getRegistrationDetailsAction(CODE)
    const checkout = await startRegistrationCheckoutAction(CODE)
    expect(details).toMatchObject({ status: 401, code: API_ERROR_CODE.NOT_AUTHENTICATED })
    expect(details.error).toContain("mesmo aparelho")
    expect(checkout).toMatchObject({ status: 401, code: API_ERROR_CODE.NOT_AUTHENTICATED })
    expect(getRegistrationDetails).not.toHaveBeenCalled()
    expect(createRegistrationCheckout).not.toHaveBeenCalled()
  })

  it("repassa o token do cookie para o status", async () => {
    getRegistrationDetails.mockResolvedValue({ codigo: CODE })
    const response = await getRegistrationDetailsAction(CODE)
    expect(response.status).toBe(200)
    expect(getRegistrationDetails).toHaveBeenCalledWith(CODE, "tok")
  })

  it("devolve só o checkoutUrl validado do Mercado Pago", async () => {
    createRegistrationCheckout.mockResolvedValue({
      pagamentoId: 1,
      status: PAYMENT_STATUS.PENDING,
      checkoutUrl: "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=1",
      expiraEm: null,
      gatewayPreferenceId: "1",
    })
    const response = await startRegistrationCheckoutAction(CODE)
    expect(createRegistrationCheckout).toHaveBeenCalledWith(CODE, "tok")
    expect(response).toEqual({
      status: 201,
      data: { checkoutUrl: "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=1" },
    })
  })

  it("checkout sem checkoutUrl vira INVALID_CHECKOUT_URL", async () => {
    createRegistrationCheckout.mockResolvedValue({
      pagamentoId: 1,
      status: PAYMENT_STATUS.CREATED,
      checkoutUrl: null,
      expiraEm: null,
      gatewayPreferenceId: null,
    })
    const response = await startRegistrationCheckoutAction(CODE)
    expect(response).toMatchObject({ status: 502, code: API_ERROR_CODE.INVALID_CHECKOUT_URL })
  })
})
