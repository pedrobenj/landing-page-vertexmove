import { ArrowRight } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

import { SectionBand, SectionHeading } from "@/components/sections"
import { Button } from "@/components/ui/button"

interface PartnerRacesBandProps {
  children: ReactNode
}

/** Moldura da seção "Próximas corridas parceiras" (conteúdo e skeleton). */
export function PartnerRacesBand({ children }: PartnerRacesBandProps) {
  return (
    <SectionBand aria-labelledby="parceiras-title">
      <SectionHeading
        id="parceiras-title"
        eyebrow="Agenda parceira"
        title="Próximas corridas parceiras"
        description="Corridas com benefícios exclusivos para a nossa comunidade."
        actions={
          <Button asChild variant="outline" size="xl" className="w-full shadow-sm sm:w-auto">
            <Link href="/corridas-parceiras">
              Ver todas
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        }
      />
      {children}
    </SectionBand>
  )
}
