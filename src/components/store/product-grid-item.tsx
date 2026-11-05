import type { StoreProduct } from "@/types/store-product.interface"

import { ProductCard } from "./product-card"

interface ProductGridItemProps {
  product: StoreProduct
}

export function ProductGridItem({ product }: ProductGridItemProps) {
  return (
    <li>
      <ProductCard product={product} />
    </li>
  )
}
