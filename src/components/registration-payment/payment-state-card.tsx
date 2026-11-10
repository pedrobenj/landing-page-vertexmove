import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils/cn"

interface PaymentStateCardProps {
  icon: LucideIcon
  title: string
  description: string
  tone: "success" | "waiting" | "warning"
  /** Anuncia a mudança para leitores de tela (o status muda sozinho durante o polling). */
  live?: boolean
  iconClassName?: string
  children?: ReactNode
}

const TONE_CLASSES: Record<PaymentStateCardProps["tone"], string> = {
  success: "bg-brand-navy-deep text-white",
  waiting: "border bg-slate-50",
  warning: "border border-destructive/30 bg-destructive/5",
}

export function PaymentStateCard({ icon: Icon, title, description, tone, live, iconClassName, children }: PaymentStateCardProps) {
  return (
    <section
      aria-live={live ? "polite" : undefined}
      data-testid="payment-state"
      className={cn("flex flex-col gap-5 rounded-2xl p-6 sm:p-8", TONE_CLASSES[tone])}
    >
      <div className="flex items-start gap-4">
        <span
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-full",
            tone === "success" ? "bg-brand-green text-brand-navy-deep" : "bg-white text-brand-navy-deep shadow-sm",
          )}
        >
          <Icon aria-hidden="true" className={cn("size-6", iconClassName)} />
        </span>
        <div className="flex flex-col gap-1">
          <h2 className={cn("font-heading text-xl font-black", tone === "success" ? "text-white" : "text-brand-navy-deep")}>
            {title}
          </h2>
          <p className={tone === "success" ? "text-white/80" : "text-muted-foreground"}>{description}</p>
        </div>
      </div>
      {children && <div className="flex flex-col gap-3 sm:flex-row">{children}</div>}
    </section>
  )
}
