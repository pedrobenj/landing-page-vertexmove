import "server-only"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { apiFetch, type ApiFetchOptions } from "./api-client"
import { isApiError } from "./api-error"

export const ADMIN_ACCESS_TOKEN_COOKIE = "vm_admin_at"
const LOGIN_PATH = "/admin/login"

/**
 * `apiFetch` com o Bearer do cookie `vm_admin_at`. Sem token ou com 401 da API → `/admin/login`.
 *
 * TODO(migracao): Task 6 — versão completa sobre `admin-session.ts` (getAccessToken/clearSession).
 */
export async function adminFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const token = (await cookies()).get(ADMIN_ACCESS_TOKEN_COOKIE)?.value
  if (!token) redirect(LOGIN_PATH)

  try {
    return await apiFetch<T>(path, { ...options, headers: { ...options.headers, Authorization: `Bearer ${token}` } })
  } catch (error) {
    if (isApiError(error) && error.status === 401) redirect(LOGIN_PATH)
    throw error
  }
}
