import type { StoreProduct } from "@/types/store-product.interface"

import { isProductSoldOut } from "./product-stock"

/** Uma linha da grade da loja no desktop. */
export const HOME_PRODUCTS_LIMIT = 4

/**
 * Vitrine da home: destaques primeiro, depois os demais; dentro de cada grupo, os com estoque antes
 * dos esgotados. Mantém a ordem da API (a do admin) no resto.
 */
export function pickHomeProducts(products: StoreProduct[], limit = HOME_PRODUCTS_LIMIT): StoreProduct[] {
  const rank = (product: StoreProduct) => (product.isFeatured ? 0 : 2) + (isProductSoldOut(product) ? 1 : 0)
  return products
    .map((product, index) => ({ product, index }))
    .sort((a, b) => rank(a.product) - rank(b.product) || a.index - b.index)
    .slice(0, limit)
    .map(({ product }) => product)
}
