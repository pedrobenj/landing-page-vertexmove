import { Mountain } from "lucide-react"
import { unstable_rethrow } from "next/navigation"
import { connection } from "next/server"

import { EmptyState, ServerError } from "@/components/feedback"
import { canManageEvents } from "@/lib/utils/admin-permissions"
import { getFortalezaToday } from "@/lib/utils/get-fortaleza-today"
import { selectUpcomingAdminEvents } from "@/lib/utils/select-upcoming-admin-events"
import { listAdminEvents } from "@/server/api/endpoints/admin-events"
import { loadEventReadiness } from "@/server/api/load-event-readiness"
import { requireAdminSession } from "@/server/api/require-admin-session"

import { NewEventLink } from "../eventos/components/new-event-link"

import { UpcomingEventCard } from "./upcoming-event-card"

/** Maior página da API: o dashboard escolhe as próximas entre elas. */
const EVENTS_PAGE_LIMIT = 100

/** "Próximos topos": até 3 corridas futuras com o checklist do que falta para abrir inscrições. */
export async function UpcomingEvents() {
  await connection()
  const admin = await requireAdminSession()
  const now = new Date()

  let events
  try {
    events = selectUpcomingAdminEvents((await listAdminEvents({ limit: EVENTS_PAGE_LIMIT })).items, getFortalezaToday(now))
  } catch (error) {
    unstable_rethrow(error)
    console.error("[UpcomingEvents]", error instanceof Error ? error.name : "erro desconhecido")
    return <ServerError title="Não foi possível carregar as próximas provas" />
  }

  if (events.length === 0) {
    return (
      <EmptyState
        icon={Mountain}
        title="Nenhuma prova ainda. Que tal a primeira subida?"
        description="Cadastre a corrida, as distâncias com lote de preço, o regulamento e o termo."
        action={canManageEvents(admin.papel) && <NewEventLink />}
      />
    )
  }

  const results = await Promise.all(events.map((event) => loadEventReadiness(event.id, now)))
  return (
    <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event, index) => (
        <UpcomingEventCard key={event.id} event={event} result={results[index]!} />
      ))}
    </ul>
  )
}
