import { ArrowRight } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

import { SectionBand, SectionHeading } from "@/components/sections"
import { Button } from "@/components/ui/button"

interface PastEventsBandProps {
  children: ReactNode
}

/** Moldura da seção "Corridas que já vivemos" (usada pelo conteúdo e pelo skeleton). */
export function PastEventsBand({ children }: PastEventsBandProps) {
  return (
    <SectionBand aria-labelledby="historia-title">
      <SectionHeading
        id="historia-title"
        eyebrow="Nossa história em movimento"
        title="Corridas que já vivemos"
        description="Edições que viraram histórias, conquistas e amizades."
      />
      {children}
      <Button asChild variant="outline" size="xl" className="w-full shadow-sm sm:w-fit">
        <Link href="/corridas/encerradas">
          Ver todas as corridas
          <ArrowRight aria-hidden="true" />
        </Link>
      </Button>
    </SectionBand>
  )
}
