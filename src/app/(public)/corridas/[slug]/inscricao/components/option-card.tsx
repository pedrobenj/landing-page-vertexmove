import { CheckCircle2 } from "lucide-react"
import type { ReactNode, Ref } from "react"

import { Label } from "@/components/ui/label"
import { RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"

/**
 * Padding do card e posição do check, casados: o check fica no canto do conteúdo (mesmo recuo do padding)
 * e centralizado na primeira linha do título. `default` = título `text-lg` (28px de linha), `large` = `text-2xl` (32px).
 */
const SIZES = {
  // top = padding + metade da linha do título (o check é centralizado com -translate-y-1/2).
  default: { card: "p-4", check: "top-[1.875rem] right-4" },
  large: { card: "gap-3 p-5", check: "top-9 right-5" },
} as const

interface OptionCardProps {
  id: string
  value: string
  disabled?: boolean
  /** Ref do rádio (ex.: `field.ref` do RHF, para focar a opção quando o grupo tem erro). */
  inputRef?: Ref<HTMLButtonElement>
  size?: keyof typeof SIZES
  children: ReactNode
  className?: string
}

/**
 * Opção de RadioGroup em forma de card selecionável (distância, kit). O rádio nativo fica escondido
 * (`sr-only`), mas continua focável e navegável pelas setas do teclado. O check fica dentro do card
 * (posicionado em relação a ele) e aparece quando o rádio irmão está marcado.
 */
export function OptionCard({ id, value, disabled, inputRef, size = "default", children, className }: OptionCardProps) {
  const sizing = SIZES[size]

  return (
    <div className="h-full">
      <RadioGroupItem ref={inputRef} value={value} id={id} disabled={disabled} className="peer sr-only" />
      <Label
        htmlFor={id}
        className={cn(
          "relative flex h-full cursor-pointer flex-col items-start gap-1 rounded-2xl border-2 border-border bg-card font-normal transition-colors hover:border-brand-navy/40",
          sizing.card,
          "peer-data-[state=checked]:border-brand-navy-deep peer-data-[state=checked]:bg-brand-navy/5",
          "peer-data-[state=checked]:[&>[data-option-check]]:block",
          "peer-focus-visible:ring-3 peer-focus-visible:ring-ring/60 peer-focus-visible:ring-offset-2",
          "peer-disabled:cursor-not-allowed peer-disabled:bg-slate-50 peer-disabled:opacity-70 peer-disabled:hover:border-border",
          className,
        )}
      >
        {children}
        <CheckCircle2
          aria-hidden="true"
          data-option-check=""
          className={cn("pointer-events-none absolute hidden size-5 -translate-y-1/2 text-brand-navy-deep", sizing.check)}
        />
      </Label>
    </div>
  )
}
