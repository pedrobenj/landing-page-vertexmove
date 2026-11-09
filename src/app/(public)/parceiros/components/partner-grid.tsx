import type { Partner } from "@/types/partner.interface"

import { PartnerGridItem } from "./partner-grid-item"

interface PartnerGridProps {
  partners: Partner[]
}

export function PartnerGrid({ partners }: PartnerGridProps) {
  return (
    <ul aria-label="Parceiros do Vertex" className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {partners.map((partner) => (
        <PartnerGridItem key={partner.nome} partner={partner} />
      ))}
    </ul>
  )
}
