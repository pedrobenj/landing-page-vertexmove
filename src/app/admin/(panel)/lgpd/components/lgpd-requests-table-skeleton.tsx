import { Skeleton } from "@/components/ui/skeleton"

export function LgpdRequestsTableSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Carregando solicitações" className="flex flex-col gap-2 rounded-xl border bg-card p-4">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-14 w-full" />
    </div>
  )
}
