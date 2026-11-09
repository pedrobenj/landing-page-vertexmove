import type { PublicEvent } from "@/types/api/event.interface"

import { EventCard } from "./event-card"

interface EventListProps {
  events: PublicEvent[]
}

export function EventList({ events }: EventListProps) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <li key={event.slug}>
          <EventCard event={event} />
        </li>
      ))}
    </ul>
  )
}
