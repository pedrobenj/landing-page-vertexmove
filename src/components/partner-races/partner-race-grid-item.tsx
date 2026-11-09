import type { PartnerRace } from "@/types/api/partner-race.interface"

import { PartnerRaceCard } from "./partner-race-card"

interface PartnerRaceGridItemProps {
  race: PartnerRace
}

export function PartnerRaceGridItem({ race }: PartnerRaceGridItemProps) {
  return (
    <li>
      <PartnerRaceCard race={race} />
    </li>
  )
}
