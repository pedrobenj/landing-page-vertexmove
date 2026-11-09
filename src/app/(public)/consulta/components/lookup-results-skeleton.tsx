import { Skeleton } from "@/components/ui/skeleton"

/** Mesmo layout da lista de resultados. */
export function LookupResultsSkeleton() {
  return (
    <ul aria-busy="true" aria-label="Buscando inscrições" className="flex flex-col gap-4">
      {Array.from({ length: 2 }, (_, index) => (
        <li key={index} className="flex flex-col gap-4 rounded-2xl border bg-card p-5 sm:p-6">
          <div className="flex justify-between gap-3">
            <Skeleton className="h-6 w-2/3 max-w-xs" />
            <Skeleton className="h-7 w-24 rounded-full" />
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-40" />
          </div>
        </li>
      ))}
    </ul>
  )
}
