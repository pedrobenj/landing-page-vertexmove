import "server-only"

import { CART_ISSUE_REASON } from "@/enums/cart-issue-reason.enum"
import type { CartIssue, CartItem, PricedCart, PricedCartLine } from "@/types/cart.interface"
import type { StoreProduct, StoreVariant } from "@/types/store-product.interface"

interface VariantMatch {
  product: StoreProduct
  variant: StoreVariant
}

function indexVariants(products: StoreProduct[]): Map<string, VariantMatch> {
  const index = new Map<string, VariantMatch>()
  for (const product of products) {
    for (const variant of product.variants) {
      index.set(variant.id, { product, variant })
    }
  }
  return index
}

function describeItem({ product, variant }: VariantMatch): string {
  return `${product.name} (${variant.label})`
}

/**
 * Precifica o carrinho com os dados ATUAIS do servidor (preço, estoque, produto ativo).
 * Nunca usa valores vindos do navegador além de variantId e quantity.
 */
export function priceCart(items: CartItem[], products: StoreProduct[]): PricedCart {
  const index = indexVariants(products)
  const lines: PricedCartLine[] = []
  const issues: CartIssue[] = []

  for (const item of items) {
    const match = index.get(item.variantId)

    if (!match || !match.product.isActive) {
      issues.push({
        variantId: item.variantId,
        reason: CART_ISSUE_REASON.UNAVAILABLE,
        availableQuantity: 0,
        message: "Um item do seu carrinho não está mais disponível",
      })
      continue
    }

    if (match.variant.stock <= 0) {
      issues.push({
        variantId: item.variantId,
        reason: CART_ISSUE_REASON.INSUFFICIENT_STOCK,
        availableQuantity: 0,
        message: `${describeItem(match)} esgotou`,
      })
      continue
    }

    const quantity = Math.min(item.quantity, match.variant.stock)
    if (quantity < item.quantity) {
      issues.push({
        variantId: item.variantId,
        reason: CART_ISSUE_REASON.INSUFFICIENT_STOCK,
        availableQuantity: quantity,
        message: `Só restam ${quantity} unidades de ${describeItem(match)}`,
      })
    }

    lines.push({
      variantId: match.variant.id,
      productId: match.product.id,
      productSlug: match.product.slug,
      productName: match.product.name,
      productType: match.product.type,
      variantLabel: match.variant.label,
      imageUrl: match.product.imageUrls[0] ?? null,
      unitPrice: match.product.price,
      quantity,
      lineTotal: match.product.price * quantity,
      pickupInfo: match.product.pickupInfo,
    })
  }

  return {
    lines,
    issues,
    total: lines.reduce((sum, line) => sum + line.lineTotal, 0),
    itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
  }
}
