import { StaggerItem } from "@/components/motion"
import type { PublicEvent } from "@/types/api/event.interface"

import { EventCard } from "./event-card"

interface EventListItemProps {
  event: PublicEvent
}

export function EventListItem({ event }: EventListItemProps) {
  return (
    <StaggerItem>
      <EventCard event={event} />
    </StaggerItem>
  )
}
