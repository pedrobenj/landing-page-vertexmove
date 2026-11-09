import { Skeleton } from "@/components/ui/skeleton"

/** Mesmo layout do `ProductsTable`: botão "Novo produto" à direita e a tabela. */
export function ProductsTableSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Carregando produtos" className="flex flex-col gap-4">
      <Skeleton className="h-9 w-32 self-end" />
      <div className="flex flex-col gap-2 rounded-xl border bg-card p-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  )
}
