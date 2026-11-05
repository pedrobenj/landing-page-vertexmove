interface WithVariants {
  variants: { stock: number }[]
}

export function getTotalStock(product: WithVariants): number {
  return product.variants.reduce((total, variant) => total + variant.stock, 0)
}

export function isProductSoldOut(product: WithVariants): boolean {
  return product.variants.every((variant) => variant.stock <= 0)
}
