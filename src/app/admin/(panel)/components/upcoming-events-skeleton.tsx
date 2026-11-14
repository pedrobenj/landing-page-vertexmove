import { Skeleton } from "@/components/ui/skeleton"

export function UpcomingEventsSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Carregando próximas provas" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Skeleton className="h-60 rounded-2xl" />
      <Skeleton className="h-60 rounded-2xl" />
      <Skeleton className="h-60 rounded-2xl" />
    </div>
  )
}
