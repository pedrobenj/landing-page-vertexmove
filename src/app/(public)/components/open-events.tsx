import { CalendarX2 } from "lucide-react"
import Link from "next/link"

import { EmptyState, ServerError } from "@/components/feedback"
import { Button } from "@/components/ui/button"
import { isApiError } from "@/server/api/api-error"
import { listPublicEvents } from "@/server/api/endpoints/events"
import type { PublicEvent } from "@/types/api/event.interface"

import { EventList } from "./event-list"

export async function OpenEvents() {
  let events: PublicEvent[]
  try {
    events = (await listPublicEvents()).items
  } catch (error) {
    if (!isApiError(error)) throw error
    return <ServerError title="Não foi possível carregar as corridas" />
  }

  if (events.length === 0) {
    return (
      <EmptyState
        icon={CalendarX2}
        title="Nenhuma corrida aberta no momento."
        description="Volte em breve!"
        action={
          <Button asChild variant="outline">
            <Link href="/corridas/encerradas">Ver corridas encerradas</Link>
          </Button>
        }
      />
    )
  }

  return <EventList events={events} />
}
