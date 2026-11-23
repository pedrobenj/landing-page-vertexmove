import { Skeleton } from "@/components/ui/skeleton"

export function AccountDetailsSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Carregando conta" className="flex flex-col gap-2 rounded-xl border bg-card p-4">
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-6 w-1/2" />
    </div>
  )
}
