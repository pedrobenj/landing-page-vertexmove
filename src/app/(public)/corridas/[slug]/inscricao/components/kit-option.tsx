import type { Ref } from "react"

import { formatCurrency } from "@/lib/utils"

import { OptionCard } from "./option-card"

interface KitOptionProps {
  /** `"none"` para a opção "Sem kit". */
  value: string
  name: string
  description?: string | null
  /** Valor somado ao da inscrição; ausente na opção "Sem kit". */
  priceCents?: number
  inputRef?: Ref<HTMLButtonElement>
}

export function KitOption({ value, name, description, priceCents, inputRef }: KitOptionProps) {
  return (
    <OptionCard id={`kit-${value}`} value={value} inputRef={inputRef}>
      <span className="pr-6 font-heading text-lg font-black text-brand-navy-deep">{name}</span>
      {description && <span className="text-sm text-muted-foreground">{description}</span>}
      <span className="mt-auto font-heading text-lg font-black text-brand-navy-deep tabular-nums">
        {priceCents === undefined ? "Sem custo adicional" : `+ ${formatCurrency(priceCents)}`}
      </span>
    </OptionCard>
  )
}
