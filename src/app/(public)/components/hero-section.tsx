import { Suspense } from "react"

import { NextRaceHero } from "./next-race-hero"
import { NextRaceHeroSkeleton } from "./next-race-hero-skeleton"

export function HeroSection() {
  return (
    <Suspense fallback={<NextRaceHeroSkeleton />}>
      <NextRaceHero />
    </Suspense>
  )
}
