"use client"

import { Loader2 } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { loadMorePastEventsAction } from "@/app/actions/past-events"
import { Button } from "@/components/ui/button"
import { appendUniqueEvents } from "@/lib/utils/append-unique-events"
import type { PublicEvent } from "@/types/api/event.interface"

import { PastEventGrid } from "./past-event-grid"

interface PastEventFeedProps {
  initialEvents: PublicEvent[]
  initialCursor: string | null
}

/** Grade do histórico com "Carregar mais" (cursor de `GET /eventos/encerrados`). */
export function PastEventFeed({ initialEvents, initialCursor }: PastEventFeedProps) {
  const [events, setEvents] = useState(initialEvents)
  const [cursor, setCursor] = useState(initialCursor)
  const [isPending, startTransition] = useTransition()

  function handleLoadMore() {
    if (!cursor) return
    startTransition(async () => {
      const response = await loadMorePastEventsAction(cursor)
      if (!response.data) {
        toast.error(response.title, { description: response.error })
        return
      }
      const page = response.data
      setEvents((current) => appendUniqueEvents(current, page.items))
      setCursor(page.nextCursor)
    })
  }

  return (
    <div className="flex flex-col gap-10">
      <PastEventGrid events={events} />
      {cursor && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
            onClick={handleLoadMore}
            disabled={isPending}
            aria-busy={isPending}
          >
            {isPending && <Loader2 aria-hidden="true" className="animate-spin" />}
            {isPending ? "Carregando…" : "Carregar mais edições"}
          </Button>
        </div>
      )}
    </div>
  )
}
