interface SummaryPriceLineProps {
  label: string
  value: string
}

/** Linha do quadro de valores do resumo (inscrição, kit). */
export function SummaryPriceLine({ label, value }: SummaryPriceLineProps) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <dt className="text-white/75">{label}</dt>
      <dd className="font-semibold tabular-nums">{value}</dd>
    </div>
  )
}
