import { Skeleton } from "@/components/ui/skeleton"

/** Mesmo layout do `AdminsTable`: botão "Novo admin" à direita e a tabela. */
export function AdminsTableSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Carregando admins" className="flex flex-col gap-4">
      <Skeleton className="h-9 w-32 self-end" />
      <div className="flex flex-col gap-2 rounded-xl border bg-card p-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  )
}
