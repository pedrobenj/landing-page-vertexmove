import { describe, expect, it } from "vitest"

import { PAYMENT_STATUS } from "@/enums/payment-status.enum"
import { REGISTRATION_STATUS } from "@/enums/registration-status.enum"

import { getPaymentView, shouldPollPayment } from "./get-payment-view"

const pending = { status: REGISTRATION_STATUS.PENDING, pagamento: null }

describe("getPaymentView", () => {
  it("inscrição confirmada é sucesso, mesmo esperando o retorno", () => {
    const details = { status: REGISTRATION_STATUS.CONFIRMED, pagamento: { status: PAYMENT_STATUS.APPROVED } }
    expect(getPaymentView({ details, awaitingConfirmation: true, pollingExpired: false })).toBe("confirmed")
  })

  it.each([REGISTRATION_STATUS.CANCELLED, REGISTRATION_STATUS.EXPIRED])("inscrição %s fica encerrada", (status) => {
    expect(getPaymentView({ details: { status, pagamento: null }, awaitingConfirmation: false, pollingExpired: false })).toBe(
      "closed",
    )
  })

  it.each([PAYMENT_STATUS.REJECTED, PAYMENT_STATUS.CANCELLED])("pagamento %s pede nova tentativa", (status) => {
    const details = { status: REGISTRATION_STATUS.PENDING, pagamento: { status } }
    expect(getPaymentView({ details, awaitingConfirmation: true, pollingExpired: false })).toBe("payment-failed")
  })

  it("no retorno, confirma até a janela de polling acabar", () => {
    expect(getPaymentView({ details: pending, awaitingConfirmation: true, pollingExpired: false })).toBe("confirming")
    expect(getPaymentView({ details: pending, awaitingConfirmation: true, pollingExpired: true })).toBe("not-confirmed-yet")
  })

  it("Pix gerado e não pago aguarda pagamento, mesmo no retorno", () => {
    const details = { status: REGISTRATION_STATUS.PENDING, pagamento: { status: PAYMENT_STATUS.PENDING } }
    expect(getPaymentView({ details, awaitingConfirmation: true, pollingExpired: false })).toBe("awaiting-payment")
  })

  it("fora do retorno, pendente aguarda pagamento", () => {
    const details = { status: REGISTRATION_STATUS.PENDING, pagamento: { status: PAYMENT_STATUS.PENDING } }
    expect(getPaymentView({ details, awaitingConfirmation: false, pollingExpired: false })).toBe("awaiting-payment")
  })
})

describe("shouldPollPayment", () => {
  it("só consulta de novo no retorno, dentro da janela, com a inscrição pendente", () => {
    const pixPending = { status: REGISTRATION_STATUS.PENDING, pagamento: { status: PAYMENT_STATUS.PENDING } }
    const confirmed = { status: REGISTRATION_STATUS.CONFIRMED, pagamento: { status: PAYMENT_STATUS.APPROVED } }
    expect(shouldPollPayment({ details: pending, awaitingConfirmation: true, pollingExpired: false })).toBe(true)
    expect(shouldPollPayment({ details: pixPending, awaitingConfirmation: true, pollingExpired: false })).toBe(true)
    expect(shouldPollPayment({ details: confirmed, awaitingConfirmation: true, pollingExpired: false })).toBe(false)
    expect(shouldPollPayment({ details: pending, awaitingConfirmation: true, pollingExpired: true })).toBe(false)
    expect(shouldPollPayment({ details: pending, awaitingConfirmation: false, pollingExpired: false })).toBe(false)
  })
})
