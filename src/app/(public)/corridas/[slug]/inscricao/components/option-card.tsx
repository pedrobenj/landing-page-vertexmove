import { CheckCircle2 } from "lucide-react"
import type { ReactNode, Ref } from "react"

import { Label } from "@/components/ui/label"
import { RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"

interface OptionCardProps {
  id: string
  value: string
  disabled?: boolean
  /** Ref do rádio (ex.: `field.ref` do RHF, para focar a opção quando o grupo tem erro). */
  inputRef?: Ref<HTMLButtonElement>
  children: ReactNode
  className?: string
}

/**
 * Opção de RadioGroup em forma de card selecionável (distância, kit, tamanho). O rádio nativo fica
 * escondido (`sr-only`), mas continua focável e navegável pelas setas do teclado.
 */
export function OptionCard({ id, value, disabled, inputRef, children, className }: OptionCardProps) {
  return (
    <div className="relative h-full">
      <RadioGroupItem ref={inputRef} value={value} id={id} disabled={disabled} className="peer sr-only" />
      <Label
        htmlFor={id}
        className={cn(
          "flex h-full cursor-pointer flex-col items-start gap-1 rounded-2xl border-2 border-border bg-card p-4 font-normal transition-colors hover:border-brand-navy/40",
          "peer-data-[state=checked]:border-brand-navy-deep peer-data-[state=checked]:bg-brand-navy/5",
          "peer-focus-visible:ring-3 peer-focus-visible:ring-ring/60 peer-focus-visible:ring-offset-2",
          "peer-disabled:cursor-not-allowed peer-disabled:bg-slate-50 peer-disabled:opacity-70 peer-disabled:hover:border-border",
          className,
        )}
      >
        {children}
      </Label>
      <CheckCircle2
        aria-hidden="true"
        className="pointer-events-none absolute top-3 right-3 hidden size-5 text-brand-navy-deep peer-data-[state=checked]:block"
      />
    </div>
  )
}
