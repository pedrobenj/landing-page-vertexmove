import { StaggerItem } from "@/components/motion"
import type { PartnerRace } from "@/types/api/partner-race.interface"

import { PartnerRaceCard } from "./partner-race-card"

interface PartnerRaceGridItemProps {
  race: PartnerRace
}

export function PartnerRaceGridItem({ race }: PartnerRaceGridItemProps) {
  return (
    <StaggerItem>
      <PartnerRaceCard race={race} />
    </StaggerItem>
  )
}
