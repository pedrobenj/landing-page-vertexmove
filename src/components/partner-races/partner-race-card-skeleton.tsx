import { Skeleton } from "@/components/ui/skeleton"

/** Mesmo layout do `PartnerRaceCard`: capa 4:3, nome, 3 linhas de info, cupom e botão. */
export function PartnerRaceCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border bg-card">
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="flex flex-col gap-4 p-5">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-2/5" />
        </div>
        <Skeleton className="h-[5.25rem] rounded-xl" />
        <Skeleton className="h-11 rounded-xl" />
      </div>
    </div>
  )
}
