import type { ORDER_STATUS } from "@/enums/order-status.enum"

export interface Buyer {
  name: string
  cpf: string
  whatsapp: string
  email: string
}

export interface NewOrderLine {
  variantId: string
  quantity: number
  /** centavos */
  unitPrice: number
  productName: string
  variantLabel: string
}

export interface NewOrderData {
  buyer: Buyer
  /** centavos */
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
  /** centavos */
  unitPrice: number
}

/** Dados públicos do pedido (sem CPF/telefone/e-mail). */
export interface OrderSummary {
  code: string
  status: ORDER_STATUS
  /** centavos */
  amount: number
  buyerFirstName: string
  createdAt: Date
  expiresAt: Date | null
  items: OrderSummaryLine[]
  pickupInfos: string[]
}
