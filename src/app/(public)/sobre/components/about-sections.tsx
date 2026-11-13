import { SectionBand, SectionHeading } from "@/components/sections"
import { ABOUT_SECTIONS } from "@/lib/utils"

import { AboutSectionCard } from "./about-section-card"

export function AboutSections() {
  return (
    <SectionBand tone="muted" aria-labelledby="quem-somos-title">
      <SectionHeading
        id="quem-somos-title"
        eyebrow="Quem somos"
        title="Um grupo que sobe junto"
        description="Gente de todos os ritmos, cada um no seu degrau, rumo ao próximo topo."
      />
      <ul className="grid gap-6 md:grid-cols-2">
        {ABOUT_SECTIONS.map((section) => (
          <AboutSectionCard key={section.id} section={section} />
        ))}
      </ul>
    </SectionBand>
  )
}
