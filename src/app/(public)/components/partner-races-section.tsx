import { Suspense } from "react"

import { PartnerRaceGridSkeleton } from "@/components/partner-races"

import { PartnerRaces } from "./partner-races"
import { PartnerRacesBand } from "./partner-races-band"

export function PartnerRacesSection() {
  return (
    <Suspense
      fallback={
        <PartnerRacesBand>
          <PartnerRaceGridSkeleton />
        </PartnerRacesBand>
      }
    >
      <PartnerRaces />
    </Suspense>
  )
}
