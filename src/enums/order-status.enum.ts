/** `status` do pedido da loja na API. */
export enum ORDER_STATUS {
  PENDING = "pendente",
  PAID = "pago",
  READY_FOR_PICKUP = "pronto_retirada",
  PICKED_UP = "retirado",
  CANCELLED = "cancelado",
  EXPIRED = "expirado",
  REFUNDED = "reembolsado",
}

export const ORDER_STATUS_LABEL: Record<ORDER_STATUS, string> = {
  [ORDER_STATUS.PENDING]: "Aguardando pagamento",
  [ORDER_STATUS.PAID]: "Pago",
  [ORDER_STATUS.READY_FOR_PICKUP]: "Pronto para retirada",
  [ORDER_STATUS.PICKED_UP]: "Retirado",
  [ORDER_STATUS.CANCELLED]: "Cancelado",
  [ORDER_STATUS.EXPIRED]: "Expirado",
  [ORDER_STATUS.REFUNDED]: "Reembolsado",
}
