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
  PUBLIC_CATALOG_CACHE_LIFE,
  SLOW_LIST_CACHE_LIFE,
  toCachedFailure,
  unwrapCached,
} from "./cached-result"

const PUBLIC_LIMIT = 50
/** Página do histórico (`/corridas/encerradas` e carrossel da home); o resto vem em "Carregar mais". */
export const PAST_EVENTS_PAGE_SIZE = 24

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
 * `GET /eventos/encerrados`: encerradas e publicadas com data passada, da mais recente para a mais antiga
 * (mesmo presenter de `GET /eventos`). Muda pouco: cache mais longo que o catálogo.
 */
async function fetchPastEvents(cursor: string | undefined): Promise<CachedResult<CursorPage<PublicEvent>>> {
  "use cache"
  cacheTag("events")
  try {
    const data = await apiFetch<CursorPage<PublicEvent>>("/eventos/encerrados", {
      query: { cursor, limit: PAST_EVENTS_PAGE_SIZE },
      forwardClient: false,
    })
    cacheLife(SLOW_LIST_CACHE_LIFE)
    return { ok: true, data }
  } catch (error) {
    cacheLife("seconds")
    return toCachedFailure(error)
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

/** Corridas encerradas (histórico); `cursor` = `nextCursor` da página anterior. Lança `ApiError`. */
export async function listPastEvents(cursor?: string): Promise<CursorPage<PublicEvent>> {
  return unwrapCached(await fetchPastEvents(cursor))
}
