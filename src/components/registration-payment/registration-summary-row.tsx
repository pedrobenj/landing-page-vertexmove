import { cn } from "@/lib/utils/cn"

interface RegistrationSummaryRowProps {
  label: string
  value: string
  emphasis?: boolean
}

export function RegistrationSummaryRow({ label, value, emphasis }: RegistrationSummaryRowProps) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className={cn("text-right", emphasis ? "font-heading text-xl font-black text-brand-navy-deep" : "font-medium")}>{value}</dd>
    </div>
  )
}
