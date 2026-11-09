import { Footprints } from "lucide-react"

import { SectionBand, SectionHeading } from "@/components/sections"

/**
 * Bloco "Treinos". TODO(cliente): o Vertex tem treinos coletivos? Se sim, local, dias e horários (CLAUDE.md §16).
 */
export function TrainingInfo() {
  return (
    <SectionBand tone="muted" aria-labelledby="treinos-title">
      <SectionHeading
        id="treinos-title"
        eyebrow="Treinos"
        title="Bora treinar junto?"
        description="Estamos organizando as informações dos nossos encontros. Enquanto isso, chame a gente no WhatsApp ou acompanhe o Instagram para saber das novidades."
      />
      <div className="flex items-center gap-4 rounded-2xl border border-dashed bg-card p-6">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-green/15 text-brand-green-text">
          <Footprints aria-hidden="true" className="size-6" />
        </span>
        <p className="text-sm text-muted-foreground">Local, dias e horários dos treinos em breve.</p>
      </div>
    </SectionBand>
  )
}
