import type { OrderStatus } from "@/generated/prisma/enums"

export interface Buyer {
  name: string
  cpf: string
  whatsapp: string
  email: string
}

export interface NewOrderLine {
  variantId: string
  quantity: number
  unitPrice: number
  productName: string
  variantLabel: string
}

export interface NewOrderData {
  buyer: Buyer
  amount: number
  expiresAt: Date
  privacyAcceptedAt: Date
  lines: NewOrderLine[]
}

export type CreatePendingOrderResult =
  | { ok: true; code: string }
  | { ok: false; outOfStockVariantIds: string[] }

export interface OrderSummaryLine {
  productName: string
  variantLabel: string
  quantity: number
  unitPrice: number
}

/** Dados públicos do pedido (sem CPF/telefone/e-mail). */
export interface OrderSummary {
  code: string
  status: OrderStatus
  amount: number
  buyerFirstName: string
  createdAt: Date
  expiresAt: Date | null
  items: OrderSummaryLine[]
  pickupInfos: string[]
}
