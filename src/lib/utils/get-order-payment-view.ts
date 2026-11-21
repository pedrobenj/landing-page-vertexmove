import { ORDER_STATUS } from "@/enums/order-status.enum"

export type OrderPaymentView = "awaiting-payment" | "confirming" | "not-confirmed-yet" | "payment-failed" | "paid" | "expired"

interface OrderPaymentViewInput {
  status: ORDER_STATUS
  /** Voltou do Checkout Pro: espera o webhook do backend confirmar. */
  awaitingConfirmation: boolean
  /** A janela de polling (1 min) acabou sem confirmação. */
  pollingExpired: boolean
  /** O Mercado Pago voltou dizendo que o pagamento não foi aprovado (só para a UX: nada é confirmado por isso). */
  checkoutFailed?: boolean
}

/** Bloco de pagamento da página do pedido. Os demais status (retirada, cancelado…) só mostram o selo. */
export function getOrderPaymentView({
  status,
  awaitingConfirmation,
  pollingExpired,
  checkoutFailed = false,
}: OrderPaymentViewInput): OrderPaymentView | null {
  if (status === ORDER_STATUS.PAID) return "paid"
  if (status === ORDER_STATUS.EXPIRED) return "expired"
  if (status !== ORDER_STATUS.PENDING) return null
  if (!awaitingConfirmation) return "awaiting-payment"
  if (checkoutFailed) return "payment-failed"
  return pollingExpired ? "not-confirmed-yet" : "confirming"
}

/**
 * Parâmetros da volta do Checkout Pro. O backend recebe o `back_urls` do pedido
 * (`/loja/pedidos/:codigo/retorno/:resultado`) e redireciona para `/pedido/<codigo>?pagamento=<sucesso|pendente|falha>`;
 * os do Mercado Pago ficam aceitos caso o `back_urls` aponte direto para o front.
 */
const CHECKOUT_RETURN_PARAMS = ["pagamento", "collection_status", "status", "payment_id", "external_reference"]

/** Voltou do Checkout Pro para `/pedido/<codigo>`? */
export function hasCheckoutReturnParams(params: Record<string, string | string[] | undefined>): boolean {
  return CHECKOUT_RETURN_PARAMS.some((name) => params[name] !== undefined)
}

const FAILED_COLLECTION_STATUSES = new Set(["rejected", "cancelled", "null"])
const FAILED_RETURN_RESULT = "falha"

/**
 * O Mercado Pago voltou com o pagamento recusado/cancelado? Só evita esperar 1 min por uma confirmação
 * que não virá: a tela oferece nova tentativa e o status do pedido continua vindo do backend.
 */
export function isFailedCheckoutReturn(params: Record<string, string | string[] | undefined>): boolean {
  if (params.pagamento !== undefined) return params.pagamento === FAILED_RETURN_RESULT
  const value = params.collection_status ?? params.status
  return typeof value === "string" && FAILED_COLLECTION_STATUSES.has(value)
}
