import { PAYMENT_STATUS } from "@/enums/payment-status.enum"
import { REGISTRATION_STATUS } from "@/enums/registration-status.enum"
import type { RegistrationDetails } from "@/types/api/registration-details.interface"

/** Tela de pagamento a mostrar para a inscrição (§7 do CLAUDE.md, "Retorno"). */
export type PaymentView =
  | "confirmed" // inscrição paga
  | "confirming" // voltou do Checkout Pro e o webhook ainda não confirmou
  | "not-confirmed-yet" // o polling acabou sem confirmação
  | "awaiting-payment" // pendente: Pix gerado e não pago, ou ainda não foi ao checkout
  | "payment-failed" // último pagamento recusado ou cancelado
  | "closed" // inscrição cancelada ou expirada

interface PaymentViewInput {
  details: Pick<RegistrationDetails, "status" | "pagamento">
  /** Veio do retorno do Checkout Pro (espera a confirmação do webhook). */
  awaitingConfirmation: boolean
  /** A janela de polling acabou. */
  pollingExpired: boolean
}

const FAILED_PAYMENT_STATUSES = new Set<string>([PAYMENT_STATUS.REJECTED, PAYMENT_STATUS.CANCELLED])

export function getPaymentView({ details, awaitingConfirmation, pollingExpired }: PaymentViewInput): PaymentView {
  if (details.status === REGISTRATION_STATUS.CONFIRMED) return "confirmed"
  if (details.status !== REGISTRATION_STATUS.PENDING) return "closed"
  if (details.pagamento && FAILED_PAYMENT_STATUSES.has(details.pagamento.status)) return "payment-failed"
  // Pix gerado e não pago: o webhook já disse "pendente".
  if (details.pagamento?.status === PAYMENT_STATUS.PENDING) return "awaiting-payment"
  // Sem notícia do webhook ainda: no retorno do Checkout Pro, espera a confirmação.
  if (awaitingConfirmation) return pollingExpired ? "not-confirmed-yet" : "confirming"
  return "awaiting-payment"
}

const POLLING_VIEWS = new Set<PaymentView>(["confirming", "awaiting-payment"])

/**
 * No retorno do Checkout Pro, continua consultando enquanto a inscrição não se resolve (um Pix pendente
 * pode ser pago com a página aberta), até a janela de polling acabar.
 */
export function shouldPollPayment(input: PaymentViewInput): boolean {
  return input.awaitingConfirmation && !input.pollingExpired && POLLING_VIEWS.has(getPaymentView(input))
}
