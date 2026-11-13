import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

interface EventInfoItemProps {
  icon: LucideIcon
  label: string
  children: ReactNode
}

/** Linha de informação do evento (sobre o hero navy): ícone em destaque, rótulo pequeno e valor. */
export function EventInfoItem({ icon: Icon, label, children }: EventInfoItemProps) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-brand-green">
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-xs font-bold tracking-wider text-white/65 uppercase">{label}</span>
        <div className="font-semibold text-white">{children}</div>
      </div>
    </li>
  )
}
