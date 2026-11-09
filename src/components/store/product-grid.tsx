import { StaggerGroup } from "@/components/motion"
import type { StoreProduct } from "@/types/store-product.interface"

import { ProductGridItem } from "./product-grid-item"

interface ProductGridProps {
  products: StoreProduct[]
}

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <StaggerGroup as="ul" className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
      {products.map((product) => (
        <ProductGridItem key={product.id} product={product} />
      ))}
    </StaggerGroup>
  )
}
