import "server-only"

import { toSessionTokens, type SessionTokens } from "./admin-session"
import { refreshRequest } from "./endpoints/admin-auth"
import { parseSetCookies } from "./set-cookie-parser"

/**
 * `POST /admin/auth/refresh` e monta os novos tokens (o refresh token rotacionado vem no `Set-Cookie`).
 * Devolve `null` em qualquer erro. Sem `next/headers`: roda no `proxy.ts`.
 */
export async function refreshSession(
  refreshToken: string,
  csrfToken: string,
  clientHeaders?: Record<string, string>,
): Promise<SessionTokens | null> {
  try {
    const { data, headers } = await refreshRequest({ refreshToken, csrfToken, clientHeaders })
    return toSessionTokens(data, parseSetCookies(headers))
  } catch {
    return null
  }
}
