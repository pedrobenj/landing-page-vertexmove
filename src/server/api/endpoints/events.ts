import "server-only"

import { cacheLife, cacheTag } from "next/cache"

import { toPublicEventDetail } from "@/lib/utils/to-public-event-detail"
import type { ApiPublicEventDetail } from "@/types/api/api-event-detail.interface"
import type { CursorPage } from "@/types/api/cursor-page.interface"
import type { PublicEvent } from "@/types/api/event.interface"
import type { PublicEventDetail } from "@/types/api/public-event-detail.interface"

import { apiFetch } from "../api-client"
import {
  type CachedResult,
  PROPOSED_LIST_CACHE_LIFE,
  proposedRouteFailure,
  PUBLIC_CATALOG_CACHE_LIFE,
  toCachedFailure,
  unwrapCached,
} from "./cached-result"

const PUBLIC_LIMIT = 50
const EMPTY_PAGE: CursorPage<PublicEvent> = { items: [], nextCursor: null }

// Dentro de "use cache" não há headers() da request: por isso `forwardClient: false`.
// Sucesso e 404 seguem o cacheLife normal; falhas transitórias (timeout, 5xx) ficam só alguns segundos.

async function fetchPublicEvents(cursor: string | undefined): Promise<CachedResult<CursorPage<PublicEvent>>> {
  "use cache"
  cacheTag("events")
  try {
    const data = await apiFetch<CursorPage<PublicEvent>>("/eventos", {
      query: { cursor, limit: PUBLIC_LIMIT },
      forwardClient: false,
    })
    cacheLife(PUBLIC_CATALOG_CACHE_LIFE)
    return { ok: true, data }
  } catch (error) {
    cacheLife("seconds")
    return toCachedFailure(error)
  }
}

async function fetchPublicEvent(slug: string): Promise<CachedResult<PublicEventDetail>> {
  "use cache"
  cacheTag("events", `event:${slug}`)
  try {
    const raw = await apiFetch<ApiPublicEventDetail>(`/eventos/${encodeURIComponent(slug)}`, { forwardClient: false })
    // O lote vigente é calculado no momento do cache; o cacheLife curto do catálogo limita o atraso na virada de lote.
    const data = toPublicEventDetail(raw, new Date())
    cacheLife(PUBLIC_CATALOG_CACHE_LIFE)
    return { ok: true, data }
  } catch (error) {
    const failure = toCachedFailure(error)
    if (failure.status === 404) cacheLife(PUBLIC_CATALOG_CACHE_LIFE)
    else cacheLife("seconds")
    return failure
  }
}

/**
 * `GET /eventos/encerrados` — rota PROPOSTA, ainda pendente no backend (§16 do CLAUDE.md).
 * Enquanto o backend real não tiver a rota, o 404 vira lista vazia.
 */
async function fetchPastEvents(): Promise<CachedResult<CursorPage<PublicEvent>>> {
  "use cache"
  cacheTag("events")
  try {
    const data = await apiFetch<CursorPage<PublicEvent>>("/eventos/encerrados", {
      query: { limit: PUBLIC_LIMIT },
      forwardClient: false,
    })
    cacheLife(PROPOSED_LIST_CACHE_LIFE)
    return { ok: true, data }
  } catch (error) {
    return proposedRouteFailure(error, EMPTY_PAGE)
  }
}

/** Corridas publicadas (`GET /eventos`). Lança `ApiError`. */
export async function listPublicEvents(cursor?: string): Promise<CursorPage<PublicEvent>> {
  return unwrapCached(await fetchPublicEvents(cursor))
}

/** Detalhe público (`GET /eventos/:slug`). Lança `ApiError` — 404 quando não publicado. */
export async function getPublicEvent(slug: string): Promise<PublicEventDetail> {
  return unwrapCached(await fetchPublicEvent(slug))
}

/** Corridas encerradas (histórico). Lista vazia se a rota ainda não existir no backend. */
export async function listPastEvents(): Promise<CursorPage<PublicEvent>> {
  return unwrapCached(await fetchPastEvents())
}
