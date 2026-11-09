import { StaggerItem } from "@/components/motion"
import type { StoreProduct } from "@/types/store-product.interface"

import { ProductCard } from "./product-card"

interface ProductGridItemProps {
  product: StoreProduct
}

export function ProductGridItem({ product }: ProductGridItemProps) {
  return (
    <StaggerItem>
      <ProductCard product={product} />
    </StaggerItem>
  )
}
