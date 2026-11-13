import { ArrowRight } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

import { SectionBand, SectionHeading } from "@/components/sections"
import { Button } from "@/components/ui/button"

interface PastEventsBandProps {
  children: ReactNode
}

/** Moldura da seção "Topos conquistados" (usada pelo conteúdo e pelo skeleton). */
export function PastEventsBand({ children }: PastEventsBandProps) {
  return (
    <SectionBand tone="muted" aria-labelledby="historia-title">
      <SectionHeading
        id="historia-title"
        eyebrow="Edições passadas"
        title="Topos conquistados"
        description="Cada edição foi um degrau. Relembre as provas que já subimos juntos."
      />
      {children}
      <Button asChild variant="outline" size="xl" className="w-full shadow-sm sm:w-fit">
        <Link href="/corridas/encerradas">
          Ver todos os topos
          <ArrowRight aria-hidden="true" />
        </Link>
      </Button>
    </SectionBand>
  )
}
