// Tipos internos do mock da loja (repositório em memória); o front usa só os de @/types/order.interface.

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
