import { PaymentMethod, PaymentStatus } from "@/generated/prisma/enums"

export { PaymentMethod, PaymentStatus }

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  PIX: "Pix",
  CARD: "Cartão de crédito",
}

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  PENDING: "Pendente",
  APPROVED: "Aprovado",
  REJECTED: "Recusado",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
}
