import { CalendarDays, Clock, MapPin, Navigation } from "lucide-react"

import { formatApiDateLong, formatEventAddress } from "@/lib/utils"
import type { PublicEvent } from "@/types/api/event.interface"

import { EventInfoItem } from "./event-info-item"
import { EventLocationMap } from "./event-location-map"

interface EventInfoListProps {
  event: PublicEvent
}

/** Data, largada, local e endereço do evento. */
export function EventInfoList({ event }: EventInfoListProps) {
  const { localizacao } = event

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      <EventInfoItem icon={CalendarDays} label="Data">
        <time dateTime={event.dataEvento} className="block first-letter:uppercase">
          {formatApiDateLong(event.dataEvento)}
        </time>
      </EventInfoItem>
      <EventInfoItem icon={Clock} label="Largada">
        <time dateTime={event.horarioLargada}>{event.horarioLargada}</time>
      </EventInfoItem>
      <EventInfoItem icon={MapPin} label="Local">
        {localizacao.localNome}
      </EventInfoItem>
      <EventInfoItem icon={Navigation} label="Endereço">
        <div className="flex flex-col gap-1">
          <address className="not-italic">{formatEventAddress(localizacao)}</address>
          <EventLocationMap location={localizacao} />
        </div>
      </EventInfoItem>
    </ul>
  )
}
