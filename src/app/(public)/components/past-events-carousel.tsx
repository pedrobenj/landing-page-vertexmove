import { PastEventCard } from "@/components/events"
import { HorizontalCarousel, HorizontalCarouselItem } from "@/components/sections"
import type { PublicEvent } from "@/types/api/event.interface"

interface PastEventsCarouselProps {
  events: PublicEvent[]
}

export function PastEventsCarousel({ events }: PastEventsCarouselProps) {
  return (
    <HorizontalCarousel label="Edições passadas">
      {events.map((event, index) => (
        <HorizontalCarouselItem position={index + 1} total={events.length} key={event.slug}>
          <PastEventCard event={event} />
        </HorizontalCarouselItem>
      ))}
    </HorizontalCarousel>
  )
}
