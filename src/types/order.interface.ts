import type { ORDER_STATUS } from "@/enums/order-status.enum"

import type { PricedCart } from "@/types/cart.interface"

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

/**
 * Resultado do checkout da loja: pedido criado, ou carrinho alterado (preço/estoque mudou entre a
 * revisão e o envio) com o carrinho recalculado para a UI mostrar os avisos.
 */
export type CreateStoreOrderResult = { ok: true; code: string } | { ok: false; cart: PricedCart }
