"use client"

import { Minus, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"

interface QuantityStepperProps {
  value: number
  min?: number
  max: number
  onChange: (value: number) => void
  label: string
}

export function QuantityStepper({ value, min = 1, max, onChange, label }: QuantityStepperProps) {
  return (
    <div role="group" aria-label={label} className="inline-flex items-center rounded-lg border">
      <Button type="button" variant="ghost" size="icon-lg" aria-label="Diminuir quantidade" disabled={value <= min} onClick={() => onChange(value - 1)}>
        <Minus />
      </Button>
      <output aria-live="polite" className="w-10 text-center font-semibold tabular-nums">
        {value}
      </output>
      <Button type="button" variant="ghost" size="icon-lg" aria-label="Aumentar quantidade" disabled={value >= max} onClick={() => onChange(value + 1)}>
        <Plus />
      </Button>
    </div>
  )
}
