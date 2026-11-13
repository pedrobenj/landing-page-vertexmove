import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

import { Chevron } from "./chevron"

interface EyebrowProps {
  children: ReactNode
  className?: string
}

/** Subtítulo curto em caixa alta com o pico da marca à frente, acima de títulos. */
export function Eyebrow({ children, className }: EyebrowProps) {
  return (
    <p
      className={cn(
        "flex items-center justify-center gap-3 text-xs font-semibold uppercase tracking-widest text-brand-navy",
        className,
      )}
    >
      <Chevron className="h-2.5 w-4 shrink-0" />
      {children}
    </p>
  )
}
