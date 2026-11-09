import { ProductGridSkeleton } from "@/components/store"
import { Skeleton } from "@/components/ui/skeleton"

/** Mesmo layout do `StoreCatalog`: filtros em pílula, título da seção e grade de produtos. */
export function StoreCatalogSkeleton() {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex gap-2">
        <Skeleton className="h-10 w-20 rounded-full" />
        <Skeleton className="h-10 w-24 rounded-full" />
        <Skeleton className="h-10 w-24 rounded-full" />
      </div>
      <div className="flex flex-col gap-5">
        <Skeleton className="h-8 w-40" />
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  )
}
