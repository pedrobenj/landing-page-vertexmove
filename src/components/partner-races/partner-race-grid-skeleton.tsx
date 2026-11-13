import { cn } from "@/lib/utils"

import { PartnerRaceCardSkeleton } from "./partner-race-card-skeleton"

const DEFAULT_PLACEHOLDER_COUNT = 3

interface PartnerRaceGridSkeletonProps {
  count?: number
  className?: string
}

export function PartnerRaceGridSkeleton({ count = DEFAULT_PLACEHOLDER_COUNT, className }: PartnerRaceGridSkeletonProps) {
  return (
    <div role="status" aria-busy="true" aria-label="Carregando corridas parceiras" className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {Array.from({ length: count }, (_, index) => (
        <PartnerRaceCardSkeleton key={index} />
      ))}
    </div>
  )
}
