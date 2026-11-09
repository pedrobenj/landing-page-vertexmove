import { PastEventCard } from "@/components/events"
import type { PublicEvent } from "@/types/api/event.interface"

interface PastEventGridItemProps {
  event: PublicEvent
}

export function PastEventGridItem({ event }: PastEventGridItemProps) {
  return (
    <li>
      <PastEventCard event={event} />
    </li>
  )
}
