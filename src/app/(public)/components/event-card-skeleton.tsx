import { Skeleton } from "@/components/ui/skeleton"

/** Mesmo layout do `EventCard`: capa 16:9, nome, data/local e botão à direita. */
export function EventCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border bg-card">
      <Skeleton className="aspect-video rounded-none" />
      <div className="flex flex-col gap-3 p-5">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="mt-2 h-10 w-36 self-end rounded-xl" />
      </div>
    </div>
  )
}
