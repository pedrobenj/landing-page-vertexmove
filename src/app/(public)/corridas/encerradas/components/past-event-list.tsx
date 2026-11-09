import { History } from "lucide-react"
import Link from "next/link"

import { EmptyState, ServerError } from "@/components/feedback"
import { Button } from "@/components/ui/button"
import { isApiError } from "@/server/api/api-error"
import { listPastEvents } from "@/server/api/endpoints/events"
import type { PublicEvent } from "@/types/api/event.interface"

import { PastEventGrid } from "./past-event-grid"

/**
 * Histórico de edições (`GET /eventos/encerrados`, rota proposta — §16).
 * Mostra a primeira página (até 50 edições).
 * TODO(backend): quando o histórico passar disso, paginar por cursor com "Carregar mais".
 */
export async function PastEventList() {
  let events: PublicEvent[]
  try {
    events = (await listPastEvents()).items
  } catch (error) {
    if (!isApiError(error)) throw error
    return <ServerError title="Não foi possível carregar as corridas encerradas" />
  }

  if (events.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="O histórico das nossas corridas chega em breve."
        description="Enquanto isso, garanta sua vaga na próxima prova."
        action={
          <Button asChild variant="outline">
            <Link href="/#corridas">Ver próximas corridas</Link>
          </Button>
        }
      />
    )
  }

  return <PastEventGrid events={events} />
}
