import "server-only"

import type { SessionTokens } from "./admin-session"
import { refreshSession } from "./session-refresh"

/** Por quanto tempo o par novo é reaproveitado por quem chegar com o refresh token antigo. */
export const REFRESH_RESULT_TTL_MS = 20_000

interface Flight {
  promise: Promise<SessionTokens | null>
  /** Quando o resultado deixa de valer; `Infinity` enquanto a chamada está em andamento. */
  expiresAt: number
}

const flights = new Map<string, Flight>()

function pruneExpired(now: number): void {
  for (const [key, flight] of flights) if (flight.expiresAt <= now) flights.delete(key)
}

/**
 * `refreshSession` em single-flight: o refresh rotaciona o token, então duas requisições concorrentes
 * com o mesmo cookie (abas, navegação + RSC) fariam o backend ver um token já usado e revogar a família.
 * Todas compartilham a mesma chamada e, por ~20 s, o mesmo par novo.
 *
 * - A chave inclui o csrf: o cache não pode dispensar o csrf que o backend exigiria.
 * - Falha (`null`) não fica em cache: só quem esperava a mesma chamada recebe o `null`.
 * - Memória do processo: em serverless, instâncias diferentes não compartilham (o backend ainda decide).
 */
export function refreshSessionOnce(
  refreshToken: string,
  csrfToken: string,
  clientHeaders?: Record<string, string>,
): Promise<SessionTokens | null> {
  const now = Date.now()
  pruneExpired(now)

  const key = `${refreshToken}\u0000${csrfToken}`
  const existing = flights.get(key)
  if (existing) return existing.promise

  const flight: Flight = { promise: refreshSession(refreshToken, csrfToken, clientHeaders), expiresAt: Infinity }
  flights.set(key, flight)
  flight.promise.then(
    (tokens) => {
      if (tokens) flight.expiresAt = Date.now() + REFRESH_RESULT_TTL_MS
      else flights.delete(key)
    },
    () => flights.delete(key),
  )
  return flight.promise
}

/** Só para testes. */
export function resetRefreshSingleFlight(): void {
  flights.clear()
}
