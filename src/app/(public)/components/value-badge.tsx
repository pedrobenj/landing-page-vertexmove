import { StaggerItem } from "@/components/motion"
import type { ValueBadgeItem } from "@/types/value-badge.interface"

interface ValueBadgeProps {
  badge: ValueBadgeItem
}

export function ValueBadge({ badge: { icon: Icon, label } }: ValueBadgeProps) {
  return (
    <StaggerItem className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3">
      <Icon aria-hidden="true" className="size-6 shrink-0 text-brand-green" />
      <span className="font-heading text-sm font-bold">{label}</span>
    </StaggerItem>
  )
}
