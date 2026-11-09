import { PartnerLogoCard } from "@/components/partners"
import { HorizontalCarousel, HorizontalCarouselItem } from "@/components/sections"
import type { Partner } from "@/types/partner.interface"

interface PartnersCarouselProps {
  partners: Partner[]
}

export function PartnersCarousel({ partners }: PartnersCarouselProps) {
  return (
    <HorizontalCarousel label="Parceiros do Vertex">
      {partners.map((partner, index) => (
        <HorizontalCarouselItem position={index + 1} total={partners.length} key={partner.nome} className="w-[44%] sm:w-[30%] lg:w-[calc((100%-4rem)/5)]">
          <PartnerLogoCard partner={partner} />
        </HorizontalCarouselItem>
      ))}
    </HorizontalCarousel>
  )
}
