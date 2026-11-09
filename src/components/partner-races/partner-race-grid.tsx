import type { PartnerRace } from "@/types/api/partner-race.interface"

import { PartnerRaceCard } from "./partner-race-card"

interface PartnerRaceGridProps {
  races: PartnerRace[]
}

export function PartnerRaceGrid({ races }: PartnerRaceGridProps) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {races.map((race) => (
        <li key={race.id}>
          <PartnerRaceCard race={race} />
        </li>
      ))}
    </ul>
  )
}
