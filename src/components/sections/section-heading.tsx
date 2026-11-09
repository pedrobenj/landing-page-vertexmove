import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

interface SectionHeadingProps {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
  id?: string
  tone?: "light" | "dark"
  /** `h1` nas páginas internas; `h2` nas seções da home. */
  as?: "h1" | "h2"
  className?: string
}

/** Eyebrow + título grande e pesado + linha de apoio, com ações à direita no desktop (CLAUDE.md §3). */
export function SectionHeading({
  eyebrow,
  title,
  description,
  actions,
  id,
  tone = "light",
  as: Heading = "h2",
  className,
}: SectionHeadingProps) {
  const isDark = tone === "dark"

  return (
    <div className={cn("flex flex-col gap-6 md:flex-row md:items-end md:justify-between", className)}>
      <div className="flex max-w-4xl flex-col gap-3">
        {eyebrow && (
          <p
            className={cn(
              "text-xs font-bold uppercase tracking-[0.2em]",
              isDark ? "text-brand-green" : "text-brand-green-text",
            )}
          >
            {eyebrow}
          </p>
        )}
        <Heading
          id={id}
          className={cn(
            "font-heading text-4xl leading-[1.05] font-black tracking-tight sm:text-5xl lg:text-[3.5rem]",
            isDark ? "text-white" : "text-brand-navy-deep",
          )}
        >
          {title}
        </Heading>
        {description && (
          <p className={cn("text-base sm:text-lg", isDark ? "text-white/75" : "text-muted-foreground")}>{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-col gap-3 sm:flex-row md:pb-1">{actions}</div>}
    </div>
  )
}
