import { Skeleton } from "@/components/ui/skeleton"

export function DistanceListSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Carregando distâncias" className="flex flex-col gap-4">
      <Skeleton className="h-48 w-full rounded-2xl" />
      <Skeleton className="h-48 w-full rounded-2xl" />
    </div>
  )
}
