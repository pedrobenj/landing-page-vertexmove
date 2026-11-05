import { ProductCardSkeleton } from "./product-card-skeleton"

interface ProductGridSkeletonProps {
  count?: number
}

export function ProductGridSkeleton({ count = 4 }: ProductGridSkeletonProps) {
  return (
    <div role="status" aria-busy="true" aria-label="Carregando produtos" className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  )
}
