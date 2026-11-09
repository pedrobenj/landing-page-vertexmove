import "server-only"

import { cacheLife } from "next/cache"

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

/** Catálogo público (`/eventos`, `/eventos/:slug`): revalidação curta (§8 do CLAUDE.md). */
export const PUBLIC_CATALOG_CACHE_LIFE = { stale: 60, revalidate: 60, expire: 300 }
/** Listas de rotas propostas (encerradas, corridas parceiras): mudam pouco. */
export const PROPOSED_LIST_CACHE_LIFE = { stale: 300, revalidate: 300, expire: 900 }

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

/*
 * Falhas transitórias usam cacheLife("seconds") (expire 60 < 300): viram buraco dinâmico, fora do shell
 * estático. Com a API fora do ar no build, o Next 16.4 às vezes avisa "Unexpected cache miss after cache
 * warming phase" em "/": quando outra rota do mesmo worker já gravou a falha no cache handler, o warming
 * acha a entrada curta, omite-a do shell e não a guarda no Resume Data Cache; a fase final então não a
 * encontra. É inofensivo (o resultado é o mesmo buraco dinâmico) e não ocorre com a API no ar (entradas
 * de 300 s ou mais). `connection()` nas seções evitaria o aviso, mas tiraria do shell estático as listas
 * que hoje são pré-renderizadas quando a API responde.
 */

/**
 * Falha de uma rota PROPOSTA (ainda pendente no backend, §16): 404 vira `empty` com o cacheLife normal;
 * as demais falhas ficam só alguns segundos. Chamar dentro do escopo `"use cache"`.
 */
export function proposedRouteFailure<T>(error: unknown, empty: T): CachedResult<T> {
  const failure = toCachedFailure(error)
  if (failure.status === 404) {
    cacheLife(PROPOSED_LIST_CACHE_LIFE)
    return { ok: true, data: empty }
  }
  cacheLife("seconds")
  return failure
}
