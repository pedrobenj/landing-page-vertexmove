import { cn, formatCurrency } from "@/lib/utils"

interface ConfirmationAmountRowProps {
  label: string
  cents: number
  /** Desconto aparece como "− R$ 44,95". */
  negative?: boolean
  emphasis?: boolean
}

export function ConfirmationAmountRow({ label, cents, negative, emphasis }: ConfirmationAmountRowProps) {
  return (
    <div className={cn("flex items-baseline justify-between gap-4 py-2.5", emphasis && "pt-4")}>
      <dt className={cn("text-sm text-muted-foreground", emphasis && "font-bold text-brand-navy-deep")}>{label}</dt>
      <dd className={cn("font-semibold text-brand-navy-deep", emphasis && "font-heading text-2xl font-black")}>
        {negative ? `− ${formatCurrency(cents)}` : formatCurrency(cents)}
      </dd>
    </div>
  )
}
