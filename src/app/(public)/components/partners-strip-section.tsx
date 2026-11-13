import { SectionBand } from "@/components/sections"
import { getPartners } from "@/server/content/partners"

import { PartnersCarousel } from "./partners-carousel"

/** Faixa de logos dos parceiros. Sem parceiros → não renderiza. */
export function PartnersStripSection() {
  const partners = getPartners()
  if (partners.length === 0) return null

  return (
    <SectionBand spacing="compact" aria-labelledby="parceiros-title">
      <h2
        id="parceiros-title"
        className="font-heading text-sm font-black uppercase tracking-[0.2em] text-brand-navy-deep"
      >
        Marcas na nossa subida
      </h2>
      <PartnersCarousel partners={partners} />
    </SectionBand>
  )
}
