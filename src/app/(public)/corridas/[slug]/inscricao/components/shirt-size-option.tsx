import type { Ref } from "react"

import { Label } from "@/components/ui/label"
import { RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import type { ShirtSize } from "@/types/api/shirt-size.interface"

interface ShirtSizeOptionProps {
  size: ShirtSize
  inputRef?: Ref<HTMLButtonElement>
}

/** Tamanho de camisa em "chip" quadrado (alvo de toque de 48px). */
export function ShirtSizeOption({ size, inputRef }: ShirtSizeOptionProps) {
  const id = `shirt-size-${size.id}`
  return (
    <div>
      <RadioGroupItem ref={inputRef} value={String(size.id)} id={id} className="peer sr-only" />
      <Label
        htmlFor={id}
        className={cn(
          "flex h-12 min-w-14 cursor-pointer items-center justify-center rounded-xl border-2 border-border bg-card px-3 font-heading font-black text-brand-navy-deep transition-colors hover:border-brand-navy/40",
          "peer-data-[state=checked]:border-brand-navy-deep peer-data-[state=checked]:bg-brand-navy-deep peer-data-[state=checked]:text-white",
          "peer-focus-visible:ring-3 peer-focus-visible:ring-ring/60 peer-focus-visible:ring-offset-2",
        )}
      >
        {size.codigo}
        {size.descricao && <span className="sr-only"> ({size.descricao})</span>}
      </Label>
    </div>
  )
}
