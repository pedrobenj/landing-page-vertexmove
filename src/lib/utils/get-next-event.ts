import type { PublicEvent } from "@/types/api/event.interface"

/** "Próximo topo" do hero: a corrida aberta com data/largada mais próxima (a API só lista as abertas). */
export function getNextEvent(events: readonly PublicEvent[]): PublicEvent | null {
  let next: PublicEvent | null = null
  for (const event of events) {
    const key = `${event.dataEvento}T${event.horarioLargada}`
    if (!next || key < `${next.dataEvento}T${next.horarioLargada}`) next = event
  }
  return next
}
