import { Suspense } from "react"

import { PartnerRaceGridSkeleton } from "@/components/partner-races"

import { PartnerRaces } from "./partner-races"
import { PartnerRacesBand } from "./partner-races-band"
import { StoreCallout } from "./store-callout"

/** Loja e provas parceiras lado a lado no desktop, empilhadas no mobile. */
export function StoreAndPartnersSection() {
  return (
    <div className="border-t bg-background py-16 sm:py-20">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[1fr_2fr] lg:gap-12">
        <StoreCallout />
        <Suspense
          fallback={
            <PartnerRacesBand>
              <PartnerRaceGridSkeleton count={2} className="lg:grid-cols-2" />
            </PartnerRacesBand>
          }
        >
          <PartnerRaces />
        </Suspense>
      </div>
    </div>
  )
}
