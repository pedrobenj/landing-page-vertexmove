import { History } from "lucide-react"
import Link from "next/link"

import { EmptyState, ServerError } from "@/components/feedback"
import { Button } from "@/components/ui/button"
import { isApiError } from "@/server/api/api-error"
import { listPastEvents } from "@/server/api/endpoints/events"
import type { CursorPage } from "@/types/api/cursor-page.interface"
import type { PublicEvent } from "@/types/api/event.interface"

import { PastEventFeed } from "./past-event-feed"

/**
 * Histórico de edições (`GET /eventos/encerrados`): a primeira página vem do servidor (cacheada);
 * as seguintes, pelo "Carregar mais" do `PastEventFeed`.
 */
export async function PastEventList() {
  let page: CursorPage<PublicEvent>
  try {
    page = await listPastEvents()
  } catch (error) {
    if (!isApiError(error)) throw error
    return <ServerError title="Não foi possível carregar as corridas encerradas" />
  }

  if (page.items.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="Os topos conquistados chegam em breve."
        description="Enquanto isso, garanta sua vaga no próximo."
        action={
          <Button asChild variant="outline">
            <Link href="/#corridas">Ver os próximos topos</Link>
          </Button>
        }
      />
    )
  }

  return <PastEventFeed initialEvents={page.items} initialCursor={page.nextCursor} />
}
