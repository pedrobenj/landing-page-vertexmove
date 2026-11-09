import { StaggerItem } from "@/components/motion"
import type { ValueBadgeItem } from "@/types/value-badge.interface"

interface ValueBadgeProps {
  badge: ValueBadgeItem
}

export function ValueBadge({ badge: { icon: Icon, label } }: ValueBadgeProps) {
  return (
    <StaggerItem className="flex flex-col gap-3 border-white/15 p-5 odd:border-r [&:nth-child(-n+2)]:border-b sm:p-6">
      <Icon aria-hidden="true" className="size-7 text-brand-green" />
      <span className="font-heading text-base font-bold">{label}</span>
    </StaggerItem>
  )
}
