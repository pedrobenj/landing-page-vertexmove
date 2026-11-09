import { Skeleton } from "@/components/ui/skeleton"

export function AuditTableSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Carregando auditoria" className="flex flex-col gap-2 rounded-xl border bg-card p-4">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-11 w-full" />
    </div>
  )
}
