import { Skeleton } from "@/components/ui/skeleton"

const PLACEHOLDER_COUNT = 3

export function PartnerRaceGridSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Carregando corridas parceiras" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: PLACEHOLDER_COUNT }, (_, index) => (
        <Skeleton key={index} className="h-[34rem] rounded-2xl" />
      ))}
    </div>
  )
}
