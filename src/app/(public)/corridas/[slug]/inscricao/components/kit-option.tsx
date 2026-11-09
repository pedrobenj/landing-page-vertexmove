import type { Ref } from "react"

import { OptionCard } from "./option-card"

interface KitOptionProps {
  /** `"none"` para a opção "Sem kit". */
  value: string
  name: string
  description?: string | null
  inputRef?: Ref<HTMLButtonElement>
}

export function KitOption({ value, name, description, inputRef }: KitOptionProps) {
  return (
    <OptionCard id={`kit-${value}`} value={value} inputRef={inputRef}>
      <span className="pr-6 font-heading text-lg font-black text-brand-navy-deep">{name}</span>
      {description && <span className="text-sm text-muted-foreground">{description}</span>}
    </OptionCard>
  )
}
