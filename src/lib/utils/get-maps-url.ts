import type { EventLocation } from "@/types/api/event.interface"

import { formatEventAddress } from "./format-event-address"

const MAPS_SEARCH_URL = "https://www.google.com/maps/search/?api=1&query="

/** Link de busca do Google Maps: pelas coordenadas, se houver; senão, pelo local + endereço. */
export function getMapsUrl(location: EventLocation): string {
  const { latitude, longitude } = location
  if (typeof latitude === "number" && typeof longitude === "number") {
    return `${MAPS_SEARCH_URL}${latitude},${longitude}`
  }
  const query = [location.localNome, formatEventAddress(location)].join(", ")
  return `${MAPS_SEARCH_URL}${encodeURIComponent(query)}`
}
