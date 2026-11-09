import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"

import { SectionBand, SectionHeading } from "@/components/sections"

import { EventListSkeleton } from "./event-list-skeleton"
import { OpenEvents } from "./open-events"

export function OpenEventsSection() {
  return (
    <SectionBand id="corridas" tone="muted" aria-labelledby="corridas-title" className="scroll-mt-16">
      <SectionHeading
        id="corridas-title"
        eyebrow="Próximas corridas"
        title="Escolha seu próximo desafio"
        description="Provas de rua organizadas com carinho, para quem está começando e para quem busca o próximo recorde."
      />
      <Suspense fallback={<EventListSkeleton />}>
        <OpenEvents />
      </Suspense>
      <Link
        href="/corridas/encerradas"
        className="flex items-center justify-between border-t px-3 pt-5 text-sm font-semibold text-brand-navy-deep hover:text-brand-green-text focus-visible:outline-2 focus-visible:outline-brand-green"
      >
        Ver corridas encerradas
        <ChevronRight aria-hidden="true" className="size-4" />
      </Link>
    </SectionBand>
  )
}
