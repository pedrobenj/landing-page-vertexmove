import { ServerError } from "@/components/feedback"
import { isApiError } from "@/server/api/api-error"
import { listPastEvents } from "@/server/api/endpoints/events"
import type { PublicEvent } from "@/types/api/event.interface"

import { PastEventsBand } from "./past-events-band"
import { PastEventsCarousel } from "./past-events-carousel"

/** Histórico de edições. Vazio → a seção some. */
export async function PastEvents() {
  let events: PublicEvent[]
  try {
    events = (await listPastEvents()).items
  } catch (error) {
    if (!isApiError(error)) throw error
    return (
      <PastEventsBand>
        <ServerError title="Não foi possível carregar as corridas encerradas" />
      </PastEventsBand>
    )
  }

  if (events.length === 0) return null

  return (
    <PastEventsBand>
      <PastEventsCarousel events={events} />
    </PastEventsBand>
  )
}
