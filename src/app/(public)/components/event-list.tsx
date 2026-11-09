// TODO(migracao): Task 9
import type { OpenEvent } from "@/types/open-event.interface"

import { EventListItem } from "./event-list-item"

interface EventListProps {
  events: OpenEvent[]
}

export function EventList({ events }: EventListProps) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <li key={event.id}>
          <EventListItem event={event} />
        </li>
      ))}
    </ul>
  )
}
