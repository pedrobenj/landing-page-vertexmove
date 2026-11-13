import {
  ClimbStepsSection,
  CommunitySection,
  HeroSection,
  OpenEventsSection,
  PartnersStripSection,
  PastEventsSection,
  StoreAndPartnersSection,
} from "./components"

/** Home: do próximo topo à comunidade (CLAUDE.md §2). */
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <OpenEventsSection />
      <ClimbStepsSection />
      <CommunitySection />
      <PastEventsSection />
      <StoreAndPartnersSection />
      <PartnersStripSection />
    </>
  )
}
