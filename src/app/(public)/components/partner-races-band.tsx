import { ArrowRight } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

import { SectionBand, SectionHeading } from "@/components/sections"

interface PartnerRacesBandProps {
  children: ReactNode
}

/** Moldura da seção "Outras trilhas" da home (usada pelo conteúdo e pelo skeleton). */
export function PartnerRacesBand({ children }: PartnerRacesBandProps) {
  return (
    <SectionBand aria-labelledby="parceiras-title">
      <SectionHeading
        id="parceiras-title"
        eyebrow="Provas parceiras"
        title="Outras trilhas, com desconto"
        description="Corridas de parceiros do Vertex com cupom para a comunidade."
        actions={
          <Link
            href="/corridas-parceiras"
            className="flex items-center gap-1 text-sm font-semibold text-brand-navy-deep hover:text-brand-green-text focus-visible:outline-2 focus-visible:outline-brand-green"
          >
            Ver todas
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        }
      />
      {children}
    </SectionBand>
  )
}
