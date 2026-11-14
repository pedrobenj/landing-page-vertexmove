import { Skeleton } from "@/components/ui/skeleton"

export function DashboardShortcutsSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Carregando atalhos" className="flex flex-col gap-3">
      <Skeleton className="h-6 w-24" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
      </div>
    </div>
  )
}
