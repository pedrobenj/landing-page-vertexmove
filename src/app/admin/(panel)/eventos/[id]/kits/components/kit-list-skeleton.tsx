import { Skeleton } from "@/components/ui/skeleton"

export function KitListSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Carregando kits" className="grid gap-4 md:grid-cols-2">
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-40 w-full rounded-2xl" />
    </div>
  )
}
