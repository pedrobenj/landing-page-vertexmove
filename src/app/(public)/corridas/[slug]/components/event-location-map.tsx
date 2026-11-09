import { ExternalLink } from "lucide-react"

import { getMapsUrl } from "@/lib/utils"
import type { EventLocation } from "@/types/api/event.interface"

interface EventLocationMapProps {
  location: EventLocation
}

/** Link "Ver no mapa" (Google Maps) pelas coordenadas ou pelo endereço. */
export function EventLocationMap({ location }: EventLocationMapProps) {
  return (
    <a
      href={getMapsUrl(location)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex w-fit items-center gap-1 text-sm font-bold text-brand-green-text underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green"
    >
      Ver no mapa
      <ExternalLink aria-hidden="true" className="size-3.5" />
      <span className="sr-only">(abre em nova aba)</span>
    </a>
  )
}
