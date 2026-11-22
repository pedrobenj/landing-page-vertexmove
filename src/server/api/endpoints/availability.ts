import "server-only"

import { unstable_rethrow } from "next/navigation"

import { applyAvailability } from "@/lib/utils/to-public-event-detail"
import type { EventAvailability } from "@/types/api/event-availability.interface"
import type { PublicEventDetail } from "@/types/api/public-event-detail.interface"

import { apiFetch } from "../api-client"
import { isApiError } from "../api-error"
import { getPublicEvent } from "./events"

/**
 * `GET /eventos/:slug/disponibilidade` — lote vigente e esgotado calculados pelo backend. **Sem**
 * `"use cache"`: muda a cada inscrição. Qualquer falha devolve `null` e a página cai no cálculo local
 * do lote (`toPublicEventDetail`), sem derrubar a corrida.
 */
export async function getEventAvailability(slug: string): Promise<EventAvailability | null> {
  try {
    return await apiFetch<EventAvailability>(`/eventos/${encodeURIComponent(slug)}/disponibilidade`)
  } catch (error) {
    unstable_rethrow(error)
    // 404 = evento não publicado: o detalhe também dá 404 e a página chama `notFound()`.
    if (isApiError(error) && error.status === 404) return null
    // Só status/código: nada de corpo (§12 do CLAUDE.md).
    console.error("[getEventAvailability]", isApiError(error) ? `${error.status} ${error.codigo}` : "erro desconhecido")
    return null
  }
}

/**
 * Detalhe (cacheado) + disponibilidade (sem cache), buscados em paralelo. Lança `ApiError` só pelo
 * detalhe (404 quando não publicado).
 */
export async function getPublicEventWithAvailability(slug: string): Promise<PublicEventDetail> {
  const [event, availability] = await Promise.all([getPublicEvent(slug), getEventAvailability(slug)])
  return applyAvailability(event, availability)
}
