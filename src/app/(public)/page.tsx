import {
  ClimbStepsSection,
  CommunitySection,
  HeroSection,
  OpenEventsSection,
  PartnersStripSection,
  PartnerRacesSection,
  PastEventsSection,
  StoreSection,
} from "./components"

/** Home: do próximo topo à comunidade (CLAUDE.md §2). */
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <OpenEventsSection />
      <ClimbStepsSection />
      <CommunitySection />
      <StoreSection />
      <PastEventsSection />
      <PartnerRacesSection />
      <PartnersStripSection />
    </>
  )
}
