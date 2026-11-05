"use client"

import { Minus, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"

interface QuantityStepperBaseProps {
  value: number
  min?: number
  max: number
  onChange: (value: number) => void
}

/** Nome acessível do grupo: `label` (texto) ou `labelledBy` (id de um elemento visível). */
type QuantityStepperProps = QuantityStepperBaseProps &
  ({ label: string; labelledBy?: never } | { labelledBy: string; label?: never })

export function QuantityStepper({ value, min = 1, max, onChange, label, labelledBy }: QuantityStepperProps) {
  return (
    <div role="group" aria-label={label} aria-labelledby={labelledBy} className="inline-flex items-center rounded-lg border">
      <Button type="button" variant="ghost" size="icon-lg" className="size-11 sm:size-9" aria-label="Diminuir quantidade" disabled={value <= min} onClick={() => onChange(value - 1)}>
        <Minus />
      </Button>
      <output aria-live="polite" className="w-10 text-center font-semibold tabular-nums">
        {value}
      </output>
      <Button type="button" variant="ghost" size="icon-lg" className="size-11 sm:size-9" aria-label="Aumentar quantidade" disabled={value >= max} onClick={() => onChange(value + 1)}>
        <Plus />
      </Button>
    </div>
  )
}
