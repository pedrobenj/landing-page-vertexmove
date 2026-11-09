import type { ReactNode } from "react"

import { Chevron } from "@/components/brand"

interface ChevronListItemProps {
  children: ReactNode
}

/** Item de lista com o chevron da marca como bullet (CLAUDE.md §3). */
export function ChevronListItem({ children }: ChevronListItemProps) {
  return (
    <li className="flex gap-3 leading-relaxed text-muted-foreground">
      <Chevron className="mt-1.5 w-3.5 shrink-0 text-brand-green-text" />
      <span>{children}</span>
    </li>
  )
}
