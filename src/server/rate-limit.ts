/** Acima disso, entradas vencidas são descartadas antes de inserir uma nova (evita crescer sem limite). */
const PRUNE_THRESHOLD = 10_000

/**
 * Limite simples por janela fixa, em memória (por instância do servidor).
 * Suficiente para o MVP; em produção com várias instâncias, trocar por Upstash/Redis.
 */
export function createRateLimiter() {
  const hits = new Map<string, { count: number; resetAt: number }>()

  function pruneExpired(now: number) {
    for (const [key, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(key)
    }
  }

  function isLimited(key: string, limit: number, windowMs: number, now = Date.now()): boolean {
    const entry = hits.get(key)
    if (!entry || entry.resetAt <= now) {
      if (hits.size > PRUNE_THRESHOLD) pruneExpired(now)
      hits.set(key, { count: 1, resetAt: now + windowMs })
      return false
    }
    entry.count += 1
    return entry.count > limit
  }

  return Object.assign(isLimited, { size: () => hits.size })
}
