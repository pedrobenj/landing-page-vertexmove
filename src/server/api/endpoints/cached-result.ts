import "server-only"

import { ApiError, isApiError } from "../api-error"

/**
 * Resultado serializável de uma chamada feita dentro de `"use cache"`.
 *
 * Um erro lançado dentro de `"use cache"` chega ao chamador sem as propriedades próprias
 * (`status`/`codigo` somem; em produção até a mensagem é trocada por um digest). Por isso as
 * funções cacheadas devolvem a falha como dado e quem chama, FORA do cache, relança `ApiError`.
 */
export type CachedResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; codigo: string; mensagem: string }

/** Converte `ApiError` em falha serializável; outros erros são relançados. */
export function toCachedFailure(error: unknown): Extract<CachedResult<never>, { ok: false }> {
  if (!isApiError(error)) throw error
  return { ok: false, status: error.status, codigo: error.codigo, mensagem: error.mensagem }
}

/** Devolve os dados ou relança a falha como `ApiError` (fora do escopo cacheado). */
export function unwrapCached<T>(result: CachedResult<T>): T {
  if (result.ok) return result.data
  throw new ApiError(result.status, result.codigo, result.mensagem)
}
