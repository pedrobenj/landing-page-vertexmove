import { Pencil } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"

interface SummarySectionProps {
  title: string
  onEdit: () => void
  editLabel: string
  children: ReactNode
}

/** Bloco do resumo com título e botão "Editar" que volta à etapa correspondente. */
export function SummarySection({ title, onEdit, editLabel, children }: SummarySectionProps) {
  return (
    <section className="rounded-2xl border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-heading text-lg font-black text-brand-navy-deep">{title}</h3>
        <Button type="button" variant="ghost" size="sm" onClick={onEdit} aria-label={editLabel} className="h-9 px-3">
          <Pencil aria-hidden="true" />
          Editar
        </Button>
      </div>
      <dl className="divide-y">{children}</dl>
    </section>
  )
}
