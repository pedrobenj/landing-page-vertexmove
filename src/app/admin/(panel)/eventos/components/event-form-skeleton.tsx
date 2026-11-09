import { Skeleton } from "@/components/ui/skeleton"

export function EventFormSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Carregando formulário" className="flex max-w-4xl flex-col gap-6">
      <Skeleton className="h-64 w-full rounded-2xl" />
      <Skeleton className="h-32 w-full rounded-2xl" />
      <Skeleton className="h-80 w-full rounded-2xl" />
      <Skeleton className="h-12 w-48 rounded-xl" />
    </div>
  )
}
