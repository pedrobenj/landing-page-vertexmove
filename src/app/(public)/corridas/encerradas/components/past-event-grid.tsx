import { StaggerGroup } from "@/components/motion"
import type { PublicEvent } from "@/types/api/event.interface"

import { PastEventGridItem } from "./past-event-grid-item"

interface PastEventGridProps {
  events: PublicEvent[]
}

export function PastEventGrid({ events }: PastEventGridProps) {
  return (
    <StaggerGroup as="ul" aria-label="Edições passadas" className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
      {events.map((event) => (
        <PastEventGridItem key={event.slug} event={event} />
      ))}
    </StaggerGroup>
  )
}
