import { MapPin } from "lucide-react"

interface PickupInfoItemProps {
  info: string
}

export function PickupInfoItem({ info }: PickupInfoItemProps) {
  return (
    <li className="flex items-start gap-2 text-sm">
      <MapPin className="mt-0.5 size-4 shrink-0 text-brand-navy" aria-hidden="true" />
      {info}
    </li>
  )
}
