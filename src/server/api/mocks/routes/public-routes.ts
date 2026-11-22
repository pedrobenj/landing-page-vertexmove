import "server-only"

import { API_ERROR_CODE } from "@/enums/api-error-code.enum"
import { EVENT_STATUS } from "@/enums/event-status.enum"

import { getMockDb } from "../mock-db"
import { apiError, json, type MockRoute } from "../mock-http"
import { toEventAvailability, toPublicEvent, toPublicEventDetail } from "../mock-mappers"
import { paginate } from "../mock-pagination"
import { todayInFortaleza } from "../mock-time"
import type { MockEvent } from "../mock-types"

function eventsWithStatus(status: EVENT_STATUS): MockEvent[] {
  return getMockDb().events.filter((event) => event.status === status && !event.deletedAt)
}

/** Como o backend (`kysely-evento.repository.ts`, modo `publico`): publicadas de hoje em diante. */
function upcomingEvents(today: string): MockEvent[] {
  return eventsWithStatus(EVENT_STATUS.PUBLISHED).filter((event) => event.dataEvento >= today)
}

/**
 * Modo `encerrados` do backend, complementar a `GET /eventos`: encerrada (não arquivada) entra na hora;
 * publicada entra no dia seguinte à corrida. Rascunho e cancelada nunca. Ordem data DESC, id DESC.
 */
function pastEvents(today: string): MockEvent[] {
  return getMockDb()
    .events.filter(
      (event) =>
        !event.deletedAt &&
        (event.status === EVENT_STATUS.CLOSED || (event.status === EVENT_STATUS.PUBLISHED && event.dataEvento < today)),
    )
    .sort((a, b) => b.dataEvento.localeCompare(a.dataEvento) || b.id - a.id)
}

export const publicRoutes: MockRoute[] = [
  {
    method: "GET",
    path: "/eventos",
    handler: ({ query }) => {
      const events = upcomingEvents(todayInFortaleza()).sort((a, b) => a.dataEvento.localeCompare(b.dataEvento) || a.id - b.id)
      const page = paginate(events, query, (event) => event.id, toPublicEvent)
      return page instanceof Response ? page : json(200, page)
    },
  },
  {
    method: "GET",
    path: "/eventos/encerrados",
    handler: ({ query }) => {
      const events = pastEvents(todayInFortaleza())
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
    // Como o backend (módulo Inscrição, `@NoStore()`): calculada a cada request.
    method: "GET",
    path: "/eventos/:slug/disponibilidade",
    handler: ({ params }) => {
      const event = eventsWithStatus(EVENT_STATUS.PUBLISHED).find((item) => item.slug === params.slug)
      if (!event) return apiError(404, API_ERROR_CODE.NOT_FOUND, "Evento não encontrado.")
      return json(200, toEventAvailability(event), { headers: new Headers({ "Cache-Control": "no-store" }) })
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
