import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

interface TextParagraphProps {
  children: ReactNode
  className?: string
}

/** Parágrafo de texto corrido das páginas institucionais. */
export function TextParagraph({ children, className }: TextParagraphProps) {
  return <p className={cn("text-base leading-relaxed text-muted-foreground", className)}>{children}</p>
}
