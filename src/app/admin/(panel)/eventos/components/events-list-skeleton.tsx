import { Skeleton } from "@/components/ui/skeleton"

import { EventsTableSkeleton } from "./events-table-skeleton"

/** Filtro + tabela, enquanto a sessão é conferida. */
export function EventsListSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-9 w-full sm:w-64" />
      <EventsTableSkeleton />
    </div>
  )
}
