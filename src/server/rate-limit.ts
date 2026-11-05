/**
 * Limite simples por janela fixa, em memória (por instância do servidor).
 * Suficiente para o MVP; em produção com várias instâncias, trocar por Upstash/Redis.
 */
export function createRateLimiter() {
  const hits = new Map<string, { count: number; resetAt: number }>()

  return function isLimited(key: string, limit: number, windowMs: number, now = Date.now()): boolean {
    const entry = hits.get(key)
    if (!entry || entry.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs })
      return false
    }
    entry.count += 1
    return entry.count > limit
  }
}
