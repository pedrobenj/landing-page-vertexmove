import "server-only"

import { API_ERROR_CODE } from "@/enums/api-error-code.enum"
import { EVENT_STATUS } from "@/enums/event-status.enum"

import { getMockDb } from "../mock-db"
import { apiError, json, type MockRoute } from "../mock-http"
import { toPublicEvent, toPublicEventDetail } from "../mock-mappers"
import { paginate } from "../mock-pagination"
import type { MockEvent } from "../mock-types"

function eventsWithStatus(status: EVENT_STATUS): MockEvent[] {
  return getMockDb().events.filter((event) => event.status === status && !event.deletedAt)
}

export const publicRoutes: MockRoute[] = [
  {
    method: "GET",
    path: "/eventos",
    handler: ({ query }) => {
      const events = eventsWithStatus(EVENT_STATUS.PUBLISHED).sort((a, b) => a.dataEvento.localeCompare(b.dataEvento))
      const page = paginate(events, query, (event) => event.id, toPublicEvent)
      return page instanceof Response ? page : json(200, page)
    },
  },
  {
    // ROTA PROPOSTA — ainda pendente no backend (§16 do CLAUDE.md).
    method: "GET",
    path: "/eventos/encerrados",
    handler: ({ query }) => {
      const events = eventsWithStatus(EVENT_STATUS.CLOSED).sort((a, b) => b.dataEvento.localeCompare(a.dataEvento))
      const page = paginate(events, query, (event) => event.id, toPublicEvent)
      return page instanceof Response ? page : json(200, page)
    },
  },
  {
    method: "GET",
    path: "/eventos/:slug",
    handler: ({ params }) => {
      const event = eventsWithStatus(EVENT_STATUS.PUBLISHED).find((item) => item.slug === params.slug)
      if (!event) return apiError(404, API_ERROR_CODE.NOT_FOUND, "Evento não encontrado.")
      return json(200, toPublicEventDetail(event))
    },
  },
  {
    // ROTA PROPOSTA — ainda pendente no backend (§16 do CLAUDE.md).
    method: "GET",
    path: "/corridas-parceiras",
    handler: () => {
      const races = [...getMockDb().partnerRaces].sort((a, b) => a.dataEvento.localeCompare(b.dataEvento))
      return json(200, races)
    },
  },
]
