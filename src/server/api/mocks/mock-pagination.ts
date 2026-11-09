import "server-only"

import { API_ERROR_CODE } from "@/enums/api-error-code.enum"
import type { CursorPage } from "@/types/api/cursor-page.interface"

import { apiError } from "./mock-http"

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

/**
 * Paginação por cursor como a da API: o cursor é o id (em string) do último item da página anterior.
 * Devolve uma `Response` 422 se `limit` estiver fora de 1–100.
 */
export function paginate<T, R>(
  items: T[],
  query: URLSearchParams,
  getId: (item: T) => number,
  map: (item: T) => R,
): CursorPage<R> | Response {
  const rawLimit = query.get("limit")
  const limit = rawLimit === null ? DEFAULT_LIMIT : Number(rawLimit)
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
    return apiError(422, API_ERROR_CODE.INVALID_DATA, "limit deve ser um inteiro entre 1 e 100.")
  }

  const cursor = query.get("cursor")
  const start = cursor ? items.findIndex((item) => String(getId(item)) === cursor) + 1 : 0
  if (cursor && start === 0) {
    return apiError(422, API_ERROR_CODE.INVALID_DATA, "Cursor inválido.")
  }

  const page = items.slice(start, start + limit)
  const hasMore = start + limit < items.length
  return {
    items: page.map(map),
    nextCursor: hasMore && page.length > 0 ? String(getId(page[page.length - 1])) : null,
  }
}
