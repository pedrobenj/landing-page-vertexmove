export enum ORDER_STATUS {
  PENDING = "PENDING",
  PAID = "PAID",
  READY_FOR_PICKUP = "READY_FOR_PICKUP",
  PICKED_UP = "PICKED_UP",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
  REFUNDED = "REFUNDED",
}

export const ORDER_STATUS_LABEL: Record<ORDER_STATUS, string> = {
  PENDING: "Aguardando pagamento",
  PAID: "Pago",
  READY_FOR_PICKUP: "Pronto para retirada",
  PICKED_UP: "Retirado",
  CANCELLED: "Cancelado",
  EXPIRED: "Expirado",
  REFUNDED: "Reembolsado",
}
