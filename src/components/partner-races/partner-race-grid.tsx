import { StaggerGroup } from "@/components/motion"
import { cn } from "@/lib/utils"
import type { PartnerRace } from "@/types/api/partner-race.interface"

import { PartnerRaceGridItem } from "./partner-race-grid-item"

interface PartnerRaceGridProps {
  races: PartnerRace[]
  /** Colunas da grade; a home usa duas (a seção divide a largura com a loja). */
  className?: string
}

export function PartnerRaceGrid({ races, className }: PartnerRaceGridProps) {
  return (
    <StaggerGroup as="ul" className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {races.map((race) => (
        <PartnerRaceGridItem key={race.id} race={race} />
      ))}
    </StaggerGroup>
  )
}
