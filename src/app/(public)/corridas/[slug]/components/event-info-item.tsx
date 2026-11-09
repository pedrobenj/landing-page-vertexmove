import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

interface EventInfoItemProps {
  icon: LucideIcon
  label: string
  children: ReactNode
}

/** Linha de informação do evento: ícone em destaque, rótulo pequeno e valor. */
export function EventInfoItem({ icon: Icon, label, children }: EventInfoItemProps) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-green/15 text-brand-green-text">
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">{label}</span>
        <div className="font-semibold text-brand-navy-deep">{children}</div>
      </div>
    </li>
  )
}
