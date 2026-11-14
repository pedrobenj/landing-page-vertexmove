import { EVENT_STATUS } from "@/enums/event-status.enum"
import type { AdminEvent } from "@/types/api/admin-event.interface"

const UPCOMING_STATUSES: readonly EVENT_STATUS[] = [EVENT_STATUS.DRAFT, EVENT_STATUS.PUBLISHED]

/** Próximas corridas do dashboard: rascunho ou publicada, de `today` (YYYY-MM-DD) em diante, por data/largada. */
export function selectUpcomingAdminEvents(events: readonly AdminEvent[], today: string, limit = 3): AdminEvent[] {
  return events
    .filter((event) => UPCOMING_STATUSES.includes(event.status) && event.dataEvento >= today)
    .sort((a, b) => `${a.dataEvento}T${a.horarioLargada}`.localeCompare(`${b.dataEvento}T${b.horarioLargada}`))
    .slice(0, limit)
}
