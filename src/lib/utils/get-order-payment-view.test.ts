import { describe, expect, it } from "vitest"

import { ORDER_STATUS } from "@/enums/order-status.enum"

import { getOrderPaymentView, hasCheckoutReturnParams, isFailedCheckoutReturn } from "./get-order-payment-view"

describe("getOrderPaymentView", () => {
  it.each([
    [ORDER_STATUS.PENDING, false, false, "awaiting-payment"],
    [ORDER_STATUS.PENDING, true, false, "confirming"],
    [ORDER_STATUS.PENDING, true, true, "not-confirmed-yet"],
    [ORDER_STATUS.PAID, true, false, "paid"],
    [ORDER_STATUS.PAID, false, false, "paid"],
    [ORDER_STATUS.EXPIRED, true, false, "expired"],
    [ORDER_STATUS.READY_FOR_PICKUP, false, false, null],
    [ORDER_STATUS.CANCELLED, true, true, null],
  ] as const)("%s (voltou do MP: %s, polling acabou: %s) → %s", (status, awaitingConfirmation, pollingExpired, view) => {
    expect(getOrderPaymentView({ status, awaitingConfirmation, pollingExpired })).toBe(view)
  })
})

describe("pagamento recusado na volta do Mercado Pago", () => {
  it("pendente com retorno recusado oferece nova tentativa sem polling; pago continua pago", () => {
    expect(getOrderPaymentView({ status: ORDER_STATUS.PENDING, awaitingConfirmation: true, pollingExpired: false, checkoutFailed: true })).toBe(
      "payment-failed",
    )
    expect(getOrderPaymentView({ status: ORDER_STATUS.PAID, awaitingConfirmation: true, pollingExpired: false, checkoutFailed: true })).toBe("paid")
  })

  it.each([
    [{ collection_status: "rejected" }, true],
    [{ collection_status: "null", status: "null" }, true],
    [{ status: "cancelled" }, true],
    [{ collection_status: "approved" }, false],
    [{ collection_status: "pending" }, false],
    [{}, false],
  ])("%j → %s", (params, failed) => {
    expect(isFailedCheckoutReturn(params)).toBe(failed)
  })
})

describe("hasCheckoutReturnParams", () => {
  it("reconhece os parâmetros que o Mercado Pago anexa no back_url", () => {
    expect(hasCheckoutReturnParams({ collection_status: "approved", external_reference: "VTX-P-AAAAA-BBBBB" })).toBe(true)
    expect(hasCheckoutReturnParams({ payment_id: "123" })).toBe(true)
    expect(hasCheckoutReturnParams({})).toBe(false)
    expect(hasCheckoutReturnParams({ utm_source: "instagram" })).toBe(false)
  })
})
