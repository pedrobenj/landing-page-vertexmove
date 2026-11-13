import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"

import { Flag } from "lucide-react"

import { PillBadge, SectionBand, SectionHeading } from "@/components/sections"

import { EventListSkeleton } from "./event-list-skeleton"
import { OpenEvents } from "./open-events"
import { OpenEventsCountBadge } from "./open-events-count-badge"

export function OpenEventsSection() {
  return (
    <SectionBand id="corridas" tone="muted" aria-labelledby="corridas-title" className="scroll-mt-16">
      <SectionHeading
        id="corridas-title"
        eyebrow="Fortaleza"
        title="Próximos topos"
        description="Escolha a prova, a distância e garanta seu lugar na largada."
        actions={
          <Suspense fallback={<PillBadge icon={Flag}>Inscrições abertas</PillBadge>}>
            <OpenEventsCountBadge />
          </Suspense>
        }
      />
      <Suspense fallback={<EventListSkeleton />}>
        <OpenEvents />
      </Suspense>
      <Link
        href="/corridas/encerradas"
        className="flex items-center justify-between border-t px-3 pt-5 text-sm font-semibold text-brand-navy-deep hover:text-brand-green-text focus-visible:outline-2 focus-visible:outline-brand-green"
      >
        Ver os topos conquistados
        <ChevronRight aria-hidden="true" className="size-4" />
      </Link>
    </SectionBand>
  )
}
