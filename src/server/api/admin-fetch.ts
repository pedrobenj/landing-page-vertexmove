import "server-only"

import { redirect } from "next/navigation"

import { ADMIN_LOGIN_PATH, ADMIN_SESSION_EXPIRED_PATH } from "@/lib/utils/constants"

import { apiFetch, type ApiFetchOptions } from "./api-client"
import { isApiError } from "./api-error"
import { getAccessToken } from "./admin-session"

/**
 * `apiFetch` com o Bearer do cookie `vm_admin_at`.
 *
 * - Sem token → `/admin/login`.
 * - `401` da API (token revogado) → `/admin/sair`, que apaga os cookies antes de ir ao login. Ir direto
 *   ao login deixaria o cookie velho no browser (Server Components não gravam cookies).
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
    if (isApiError(error) && error.status === 401) redirect(ADMIN_SESSION_EXPIRED_PATH)
    throw error
  }
}
