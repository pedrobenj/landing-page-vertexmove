import type { PartnerRace } from "@/types/api/partner-race.interface"

import { PartnerRaceGridItem } from "./partner-race-grid-item"

interface PartnerRaceGridProps {
  races: PartnerRace[]
}

export function PartnerRaceGrid({ races }: PartnerRaceGridProps) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {races.map((race) => (
        <PartnerRaceGridItem key={race.id} race={race} />
      ))}
    </ul>
  )
}
