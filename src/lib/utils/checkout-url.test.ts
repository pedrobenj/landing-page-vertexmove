import { describe, expect, it } from "vitest"

import { isAllowedCheckoutUrl, MOCK_CHECKOUT_PATH } from "./checkout-url"

describe("isAllowedCheckoutUrl", () => {
  it.each([
    "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=123",
    "https://mercadopago.com.br/checkout/v1/redirect?pref_id=123",
    "https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=123",
    "https://www.mercadopago.com/checkout/v1/redirect?pref_id=123",
  ])("aceita %s", (url) => {
    expect(isAllowedCheckoutUrl(url)).toBe(true)
  })

  it.each([
    "http://www.mercadopago.com.br/checkout",
    "https://mercadopago.com.br.evil.com/checkout",
    "https://evilmercadopago.com.br/checkout",
    "https://user:pass@www.mercadopago.com.br/checkout",
    "javascript:alert(1)",
    "/dev/checkout-pro/VX-2026-00000001",
    "",
  ])("recusa %s", (url) => {
    expect(isAllowedCheckoutUrl(url)).toBe(false)
  })

  it("aceita o checkout falso só no modo mock", () => {
    const url = `${MOCK_CHECKOUT_PATH}VX-2026-00000001`
    expect(isAllowedCheckoutUrl(url, { allowMockCheckout: true })).toBe(true)
    expect(isAllowedCheckoutUrl(`${MOCK_CHECKOUT_PATH}x//evil.com`, { allowMockCheckout: true })).toBe(false)
  })
})
