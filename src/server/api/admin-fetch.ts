import "server-only"

import { redirect } from "next/navigation"

import { ADMIN_LOGIN_PATH, ADMIN_SESSION_EXPIRED_PATH } from "@/lib/utils/constants"

import { apiFetch, type ApiFetchOptions } from "./api-client"
import { isApiError } from "./api-error"
import { clearSession, getAccessToken } from "./admin-session"

/**
 * `apiFetch` com o Bearer do cookie `vm_admin_at`.
 *
 * - Sem token → `/admin/login`.
 * - `401` da API (token revogado) → tenta apagar os cookies (só dá em server actions e route handlers) e
 *   vai a `/admin/sair`, que apaga de novo antes do login. Ir direto ao login deixaria o cookie velho no
 *   browser (Server Components não gravam cookies).
 * - Demais erros sobem como `ApiError`.
 *
 * `redirect()` funciona lançando um erro: server actions que chamam `adminFetch` dentro de `try/catch`
 * precisam de `unstable_rethrow(error)` no início do `catch`.
 */
export async function adminFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const token = await getAccessToken()
  if (!token) redirect(ADMIN_LOGIN_PATH)

  try {
    return await apiFetch<T>(path, { ...options, headers: { ...options.headers, Authorization: `Bearer ${token}` } })
  } catch (error) {
    if (isApiError(error) && error.status === 401) {
      try {
        await clearSession()
      } catch {
        // Server Component: não grava cookies; o `/admin/sair` apaga.
      }
      redirect(ADMIN_SESSION_EXPIRED_PATH)
    }
    throw error
  }
}
