import { Skeleton } from "@/components/ui/skeleton"

const PLACEHOLDER_COUNT = 3

export function EventListSkeleton() {
  return (
    <div aria-busy="true" aria-label="Carregando corridas" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: PLACEHOLDER_COUNT }, (_, index) => (
        <Skeleton key={index} className="h-56 rounded-xl" />
      ))}
    </div>
  )
}
