import { PastEventCard } from "@/components/events"
import { StaggerItem } from "@/components/motion"
import type { PublicEvent } from "@/types/api/event.interface"

interface PastEventGridItemProps {
  event: PublicEvent
}

export function PastEventGridItem({ event }: PastEventGridItemProps) {
  return (
    <StaggerItem>
      <PastEventCard event={event} />
    </StaggerItem>
  )
}
