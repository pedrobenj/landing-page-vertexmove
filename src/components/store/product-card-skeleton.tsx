import { Skeleton } from "@/components/ui/skeleton"

/** Mesmo layout do `ProductCard`: imagem quadrada, tipo, nome e preço com seta. */
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border bg-card">
      <Skeleton className="aspect-square rounded-none" />
      <div className="flex flex-col gap-2 p-3 sm:p-4">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-5 w-3/4" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="size-8 rounded-full" />
        </div>
      </div>
    </div>
  )
}
