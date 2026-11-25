import { StaggerItem } from "@/components/motion"
import type { ConnectionHighlight } from "@/types/connection-highlight.interface"

interface ConnectionHighlightItemProps {
  highlight: ConnectionHighlight
}

export function ConnectionHighlightItem({ highlight: { icon: Icon, label, value } }: ConnectionHighlightItemProps) {
  return (
    <StaggerItem className="flex items-start gap-3 rounded-xl bg-white/5 px-4 py-3">
      <Icon aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-brand-green" />
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-green">{label}</span>
        <span className="font-heading text-sm font-bold">{value}</span>
      </div>
    </StaggerItem>
  )
}
