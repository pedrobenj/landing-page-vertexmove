import { Skeleton } from "@/components/ui/skeleton"

const PLACEHOLDER_COUNT = 3

export function EventListSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Carregando corridas" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: PLACEHOLDER_COUNT }, (_, index) => (
        <div key={index} className="flex flex-col overflow-hidden rounded-2xl border">
          <Skeleton className="aspect-video rounded-none" />
          <div className="flex flex-col gap-3 p-5">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="mt-2 h-9 w-32 self-end rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  )
}
