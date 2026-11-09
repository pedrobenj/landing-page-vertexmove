import { Skeleton } from "@/components/ui/skeleton"

export function PriceTierListSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Carregando lotes" className="flex flex-col gap-2">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  )
}
