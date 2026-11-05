import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

interface EyebrowProps {
  children: ReactNode
  className?: string
}

/** Subtítulo no estilo "— GRUPO DE CORRIDA —", acima dos títulos de seção. */
export function Eyebrow({ children, className }: EyebrowProps) {
  return (
    <p
      className={cn(
        "flex items-center justify-center gap-3 text-xs font-semibold uppercase tracking-widest text-brand-navy",
        className,
      )}
    >
      <span aria-hidden="true" className="h-0.5 w-6 bg-brand-green" />
      {children}
      <span aria-hidden="true" className="h-0.5 w-6 bg-brand-green" />
    </p>
  )
}
