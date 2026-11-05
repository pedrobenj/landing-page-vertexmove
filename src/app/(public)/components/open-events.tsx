import { CalendarX } from "lucide-react"
import { connection } from "next/server"

import { EmptyState, ServerError } from "@/components/feedback"
import { listOpenEvents, type OpenEvent } from "@/server/services/event.service"

import { EventList } from "./event-list"

/** Server Component: busca as corridas abertas e trata os estados de erro, vazio e sucesso. */
export async function OpenEvents() {
  await connection()

  let events: OpenEvent[]
  try {
    events = await listOpenEvents()
  } catch (error) {
    console.error("[OpenEvents]", error)
    return <ServerError title="Não foi possível carregar as corridas" />
  }

  if (events.length === 0) {
    return (
      <EmptyState
        icon={CalendarX}
        title="Nenhuma corrida aberta no momento."
        description="Volte em breve!"
      />
    )
  }

  return <EventList events={events} />
}
