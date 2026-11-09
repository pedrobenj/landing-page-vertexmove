import { OptionCard } from "./option-card"

interface KitOptionProps {
  /** `"none"` para a opção "Sem kit". */
  value: string
  name: string
  description?: string | null
}

export function KitOption({ value, name, description }: KitOptionProps) {
  return (
    <OptionCard id={`kit-${value}`} value={value}>
      <span className="pr-6 font-heading text-lg font-black text-brand-navy-deep">{name}</span>
      {description && <span className="text-sm text-muted-foreground">{description}</span>}
    </OptionCard>
  )
}
