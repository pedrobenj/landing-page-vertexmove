import { StaggerGroup } from "@/components/motion"
import type { PublicEvent } from "@/types/api/event.interface"

import { EventListItem } from "./event-list-item"

interface EventListProps {
  events: PublicEvent[]
}

export function EventList({ events }: EventListProps) {
  return (
    <StaggerGroup as="ul" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventListItem key={event.slug} event={event} />
      ))}
    </StaggerGroup>
  )
}
