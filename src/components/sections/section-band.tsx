import { cva, type VariantProps } from "class-variance-authority"
import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

const sectionBandVariants = cva("relative", {
  variants: {
    tone: {
      white: "border-t border-border bg-background",
      muted: "border-t border-border bg-slate-50",
      dark: "bg-brand-navy-deep text-white",
      accent: "bg-brand-green text-brand-navy-deep",
    },
    spacing: {
      default: "py-16 sm:py-20",
      compact: "py-12 sm:py-14",
    },
  },
  defaultVariants: { tone: "white", spacing: "default" },
})

interface SectionBandProps extends ComponentProps<"section">, VariantProps<typeof sectionBandVariants> {
  containerClassName?: string
}

/** Faixa de seção da home/páginas internas: fundo alternado e container `max-w-6xl`. */
export function SectionBand({ tone, spacing, className, containerClassName, children, ...props }: SectionBandProps) {
  return (
    <section className={cn(sectionBandVariants({ tone, spacing }), className)} {...props}>
      <div className={cn("mx-auto flex max-w-6xl flex-col gap-10 px-4", containerClassName)}>{children}</div>
    </section>
  )
}
