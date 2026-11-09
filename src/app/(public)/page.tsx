import {
  CommunityStatsSection,
  HeroSection,
  HighlightCardsSection,
  HowItWorksSection,
  MoreThanRunningSection,
  OpenEventsSection,
  PartnerRacesSection,
  PartnersStripSection,
  PastEventsSection,
  StoreBandSection,
  TrackRegistrationBand,
} from "./components"

/** Home na ordem da referência (CLAUDE.md §2). */
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <HighlightCardsSection />
      <PastEventsSection />
      <OpenEventsSection />
      <HowItWorksSection />
      <TrackRegistrationBand />
      <PartnersStripSection />
      <StoreBandSection />
      <MoreThanRunningSection />
      <PartnerRacesSection />
      <CommunityStatsSection />
    </>
  )
}
