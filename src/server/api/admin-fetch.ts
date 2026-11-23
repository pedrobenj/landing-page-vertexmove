import "server-only"

import { redirect } from "next/navigation"

import { API_ERROR_CODE } from "@/enums/api-error-code.enum"
import { ADMIN_LOGIN_PATH, ADMIN_PASSWORD_CHANGE_REQUIRED_PATH, ADMIN_SESSION_EXPIRED_PATH } from "@/lib/utils/constants"

import { apiFetch, type ApiFetchOptions, apiFetchStream } from "./api-client"
import { isApiError } from "./api-error"
import { clearSession, getAccessToken } from "./admin-session"

/**
 * `apiFetch` com o Bearer do cookie `vm_admin_at`.
 *
 * - Sem token → `/admin/login`.
 * - `401` da API (token revogado) → tenta apagar os cookies (só dá em server actions e route handlers) e
 *   vai a `/admin/sair`, que apaga de novo antes do login. Ir direto ao login deixaria o cookie velho no
 *   browser (Server Components não gravam cookies).
 * - `403 TROCA_DE_SENHA_OBRIGATORIA` (senha temporária) → Minha conta, com o aviso; a sessão continua.
 * - Demais erros sobem como `ApiError`.
 *
 * `redirect()` funciona lançando um erro: server actions que chamam `adminFetch` dentro de `try/catch`
 * precisam de `unstable_rethrow(error)` no início do `catch`.
 */
export async function adminFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  return withAdminToken((headers) => apiFetch<T>(path, { ...options, headers: { ...options.headers, ...headers } }))
}

/** `apiFetchStream` com o Bearer do admin e o mesmo tratamento de sessão do `adminFetch` (ex.: exportar CSV). */
export async function adminFetchStream(path: string, options: ApiFetchOptions & { accept: string }): Promise<Response> {
  return withAdminToken((headers) => apiFetchStream(path, { ...options, headers: { ...options.headers, ...headers } }))
}

async function withAdminToken<T>(call: (headers: { Authorization: string }) => Promise<T>): Promise<T> {
  const token = await getAccessToken()
  if (!token) redirect(ADMIN_LOGIN_PATH)

  try {
    return await call({ Authorization: `Bearer ${token}` })
  } catch (error) {
    if (isApiError(error) && error.status === 401) {
      try {
        await clearSession()
      } catch {
        // Server Component: não grava cookies; o `/admin/sair` apaga.
      }
      redirect(ADMIN_SESSION_EXPIRED_PATH)
    }
    if (isApiError(error) && error.status === 403 && error.codigo === API_ERROR_CODE.PASSWORD_CHANGE_REQUIRED) {
      redirect(ADMIN_PASSWORD_CHANGE_REQUIRED_PATH)
    }
    throw error
  }
}
