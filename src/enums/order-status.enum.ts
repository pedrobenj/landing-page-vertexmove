import { OrderStatus } from "@/generated/prisma/enums"

export { OrderStatus }

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Aguardando pagamento",
  PAID: "Pago",
  READY_FOR_PICKUP: "Pronto para retirada",
  PICKED_UP: "Retirado",
  CANCELLED: "Cancelado",
  EXPIRED: "Expirado",
  REFUNDED: "Reembolsado",
}
