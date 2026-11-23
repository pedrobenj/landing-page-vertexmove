import type { PublicEvent } from "@/types/api/event.interface"

/** "Carregar mais": junta a próxima página sem repetir slug já exibido. */
export function appendUniqueEvents(current: PublicEvent[], incoming: PublicEvent[]): PublicEvent[] {
  const seen = new Set(current.map((event) => event.slug))
  return [...current, ...incoming.filter((event) => !seen.has(event.slug))]
}
