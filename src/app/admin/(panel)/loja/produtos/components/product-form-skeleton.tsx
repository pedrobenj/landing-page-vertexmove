import { Skeleton } from "@/components/ui/skeleton"

export function ProductFormSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Carregando formulário" className="flex max-w-2xl flex-col gap-6">
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-12 w-40" />
    </div>
  )
}
