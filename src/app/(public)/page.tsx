import {
  FeaturedProductsSection,
  FinalCtaSection,
  HeroSection,
  HowItWorksSection,
  LookupSection,
  OpenEventsSection,
} from "./components"

// TODO: seções "Sobre o Vertex" e FAQ (aguardando textos do cliente).
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <LookupSection />
      <OpenEventsSection />
      <HowItWorksSection />
      <FeaturedProductsSection />
      <FinalCtaSection />
    </>
  )
}
