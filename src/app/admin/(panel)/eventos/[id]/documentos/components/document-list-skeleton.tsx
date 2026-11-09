import { Skeleton } from "@/components/ui/skeleton"

export function DocumentListSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Carregando documentos" className="flex flex-col gap-4">
      <Skeleton className="h-36 w-full rounded-2xl" />
      <Skeleton className="h-36 w-full rounded-2xl" />
    </div>
  )
}
