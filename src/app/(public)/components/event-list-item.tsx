import type { PublicEvent } from "@/types/api/event.interface"

import { EventCard } from "./event-card"

interface EventListItemProps {
  event: PublicEvent
}

export function EventListItem({ event }: EventListItemProps) {
  return (
    <li>
      <EventCard event={event} />
    </li>
  )
}
