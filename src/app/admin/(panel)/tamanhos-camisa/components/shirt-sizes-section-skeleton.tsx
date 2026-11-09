import { Skeleton } from "@/components/ui/skeleton"

export function ShirtSizesSectionSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Carregando tamanhos" className="flex flex-col gap-4">
      <Skeleton className="ml-auto h-8 w-36" />
      <div className="flex flex-col gap-2 rounded-xl border bg-card p-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )
}
