import { Suspense } from "react"

import { PartnerRaceGridSkeleton } from "@/components/partner-races"

import { PartnerRaces } from "./partner-races"
import { PartnerRacesBand } from "./partner-races-band"

/** Corridas parceiras com cupom. Sem nenhuma, a seção some. */
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
