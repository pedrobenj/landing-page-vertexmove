import { Suspense } from "react"

import { EventListSkeleton } from "./event-list-skeleton"
import { OpenEvents } from "./open-events"
import { SectionHeading } from "./section-heading"

export function OpenEventsSection() {
  return (
    <section id="corridas" aria-labelledby="corridas-title" className="bg-muted/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-14">
        <SectionHeading id="corridas-title" eyebrow="Inscrições abertas" title="Próximas corridas" />
        <Suspense fallback={<EventListSkeleton />}>
          <OpenEvents />
        </Suspense>
      </div>
    </section>
  )
}
