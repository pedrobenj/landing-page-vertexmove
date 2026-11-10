import type { ReactNode } from "react"

interface ReceiptRowProps {
  label: string
  children: ReactNode
}

export function ReceiptRow({ label, children }: ReceiptRowProps) {
  return (
    <div className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="font-semibold break-words text-brand-navy-deep sm:text-right">{children}</dd>
    </div>
  )
}
