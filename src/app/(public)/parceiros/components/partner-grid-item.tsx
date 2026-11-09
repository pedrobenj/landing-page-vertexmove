import { PartnerLogoCard } from "@/components/partners"
import type { Partner } from "@/types/partner.interface"

interface PartnerGridItemProps {
  partner: Partner
}

export function PartnerGridItem({ partner }: PartnerGridItemProps) {
  return (
    <li>
      <PartnerLogoCard partner={partner} className="h-36" />
    </li>
  )
}
