import { cva, type VariantProps } from "class-variance-authority"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

const pillBadgeVariants = cva(
  "inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider",
  {
    variants: {
      tone: {
        /** Verde com texto navy — sobre fotos e fundos escuros. */
        accent: "bg-brand-green text-brand-navy-deep",
        /** Verde claro com texto navy — sobre fundo branco. */
        soft: "bg-brand-green/15 text-brand-navy-deep",
      },
      size: {
        default: "",
        sm: "px-2.5 py-0.5 text-[0.7rem] normal-case tracking-normal",
      },
    },
    defaultVariants: { tone: "accent", size: "default" },
  },
)

interface PillBadgeProps extends VariantProps<typeof pillBadgeVariants> {
  children: ReactNode
  icon?: LucideIcon
  /** Ponto colorido à esquerda (ex.: selo do hero). */
  dot?: boolean
  className?: string
}

/** Selo-pílula com ícone opcional. */
export function PillBadge({ children, icon: Icon, dot, tone, size, className }: PillBadgeProps) {
  return (
    <span className={cn(pillBadgeVariants({ tone, size }), className)}>
      {dot && <span aria-hidden="true" className="size-2 rounded-full bg-brand-green" />}
      {Icon && <Icon aria-hidden="true" className="size-3.5" />}
      {children}
    </span>
  )
}
