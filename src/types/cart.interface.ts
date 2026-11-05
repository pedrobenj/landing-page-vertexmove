import type { CART_ISSUE_REASON } from "@/enums/cart-issue-reason.enum"
import type { ProductType } from "@/generated/prisma/enums"

/** O que o navegador guarda. Nunca preço. */
export interface CartItem {
  variantId: string
  quantity: number
}

export interface PricedCartLine {
  variantId: string
  productId: string
  productSlug: string
  productName: string
  productType: ProductType
  variantLabel: string
  imageUrl: string | null
  /** centavos */
  unitPrice: number
  quantity: number
  /** centavos */
  lineTotal: number
  pickupInfo: string
}

export interface CartIssue {
  variantId: string
  reason: CART_ISSUE_REASON
  /** Quantidade que ainda pode ficar no carrinho (0 = remover). */
  availableQuantity: number
  message: string
}

export interface PricedCart {
  lines: PricedCartLine[]
  issues: CartIssue[]
  /** centavos */
  total: number
  itemCount: number
}
