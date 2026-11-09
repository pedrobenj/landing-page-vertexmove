import type { ReactNode } from "react"

import { FieldLegend, FieldSet } from "@/components/ui/field"

interface EventFormSectionProps {
  legend: string
  children: ReactNode
}

/** Grupo de campos do formulário de corrida: legenda + grade de 2 colunas no desktop. */
export function EventFormSection({ legend, children }: EventFormSectionProps) {
  return (
    <FieldSet className="rounded-2xl border bg-card p-4 sm:p-6">
      <FieldLegend className="font-heading font-bold text-brand-navy">{legend}</FieldLegend>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </FieldSet>
  )
}
