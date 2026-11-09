import "server-only"

import type { AdminLoginResponse, AdminProfile, AdminRefreshResponse } from "@/types/api/admin-auth.interface"

import { apiFetch, apiFetchRaw, type ApiResult } from "../api-client"
import { adminFetch } from "../admin-fetch"

export interface AdminSessionTokens {
  refreshToken: string
  csrfToken: string
  /** IP/User-Agent do admin, quando a chamada sai do `proxy.ts` (sem `headers()` do Next). */
  clientHeaders?: Record<string, string>
}

function sessionHeaders({ refreshToken, csrfToken, clientHeaders }: AdminSessionTokens): Record<string, string> {
  return {
    ...clientHeaders,
    Cookie: `vm_admin_rt=${refreshToken}; vm_admin_csrf=${csrfToken}`,
    "X-CSRF-Token": csrfToken,
  }
}

/** `POST /admin/auth/login`. Devolve os headers para ler o `Set-Cookie` do refresh token. Sem retries (lockout). */
export async function loginRequest(email: string, senha: string): Promise<ApiResult<AdminLoginResponse>> {
  return apiFetchRaw("/admin/auth/login", { method: "POST", body: { email, senha }, forwardClient: true })
}

/** `POST /admin/auth/refresh` — rotaciona o refresh token (novo `Set-Cookie`). */
export async function refreshRequest(tokens: AdminSessionTokens): Promise<ApiResult<AdminRefreshResponse>> {
  return apiFetchRaw("/admin/auth/refresh", { method: "POST", headers: sessionHeaders(tokens), forwardClient: false })
}

/** `POST /admin/auth/logout` (204) — revoga a família de sessões. Chamado por server action. */
export async function logoutRequest(tokens: AdminSessionTokens): Promise<void> {
  await apiFetch<void>("/admin/auth/logout", { method: "POST", headers: sessionHeaders(tokens) })
}

/** `GET /admin/me` */
export async function getMe(): Promise<AdminProfile> {
  return adminFetch("/admin/me")
}
