import "server-only"

import { API_ERROR_CODE } from "@/enums/api-error-code.enum"
import type { AdminLoginResponse, AdminProfile, AdminRefreshResponse } from "@/types/api/admin-auth.interface"

import { ACCESS_TOKEN_TTL_S, issueSession, readRefreshToken, REFRESH_TOKEN_TTL_S } from "../mock-auth"
import { getMockDb } from "../mock-db"
import { requireAdmin } from "../mock-guards"
import { apiError, json, type MockContext, type MockRoute, noContent } from "../mock-http"
import { paginate } from "../mock-pagination"
import { loginSchema, validate } from "../mock-schemas"
import type { MockAdmin } from "../mock-types"

const MAX_LOGIN_FAILURES = 5
const REFRESH_COOKIE_PATH = "/api/v1/admin/auth"

function sessionCookies(refreshToken: string, csrfToken: string): Headers {
  const headers = new Headers()
  headers.append(
    "Set-Cookie",
    `vm_admin_rt=${refreshToken}; Path=${REFRESH_COOKIE_PATH}; HttpOnly; Max-Age=${REFRESH_TOKEN_TTL_S}; SameSite=Strict`,
  )
  headers.append("Set-Cookie", `vm_admin_csrf=${csrfToken}; Path=/; Max-Age=${REFRESH_TOKEN_TTL_S}; SameSite=Strict`)
  return headers
}

function expiredCookies(): Headers {
  const headers = new Headers()
  headers.append("Set-Cookie", `vm_admin_rt=; Path=${REFRESH_COOKIE_PATH}; HttpOnly; Max-Age=0; SameSite=Strict`)
  headers.append("Set-Cookie", "vm_admin_csrf=; Path=/; Max-Age=0; SameSite=Strict")
  return headers
}

/** CSRF (cookie = header) e refresh token válido; devolve o admin ou a `Response` de erro. */
function requireRefreshSession(ctx: MockContext): MockAdmin | Response {
  const csrfCookie = ctx.cookies.vm_admin_csrf
  if (!csrfCookie || csrfCookie !== ctx.headers.get("X-CSRF-Token")) {
    return apiError(403, API_ERROR_CODE.ACCESS_DENIED, "Token CSRF ausente ou inválido.")
  }
  const adminId = readRefreshToken(ctx.cookies.vm_admin_rt)
  const admin = adminId === null ? undefined : getMockDb().admins.find((item) => item.id === adminId)
  return admin ?? apiError(401, API_ERROR_CODE.NOT_AUTHENTICATED, "Sessão expirada.")
}

export const authRoutes: MockRoute[] = [
  {
    method: "POST",
    path: "/admin/auth/login",
    handler: ({ body }) => {
      const input = validate(loginSchema, body)
      if (input instanceof Response) return input

      const db = getMockDb()
      const email = input.email.trim().toLowerCase()
      const invalid = () => apiError(401, API_ERROR_CODE.NOT_AUTHENTICATED, "Credenciais inválidas.")
      // Lockout simplificado: depois de 5 falhas seguidas, até a senha certa é recusada.
      if ((db.loginFailures[email] ?? 0) >= MAX_LOGIN_FAILURES) return invalid()

      const admin = db.admins.find((item) => item.email === email)
      if (!admin || admin.senha !== input.senha) {
        db.loginFailures[email] = (db.loginFailures[email] ?? 0) + 1
        return invalid()
      }
      delete db.loginFailures[email]
      if (admin.mfaAtivo) {
        return apiError(403, API_ERROR_CODE.MFA_REQUIRED, "Esta conta exige verificação em duas etapas.")
      }

      const session = issueSession(admin.id)
      const response: AdminLoginResponse = {
        accessToken: session.accessToken,
        tokenType: "Bearer",
        expiresIn: ACCESS_TOKEN_TTL_S,
        csrfToken: session.csrfToken,
        admin: { id: admin.id, nome: admin.nome, papel: admin.papel, mfaAtivo: admin.mfaAtivo },
      }
      return json(200, response, { headers: sessionCookies(session.refreshToken, session.csrfToken) })
    },
  },
  {
    method: "POST",
    path: "/admin/auth/refresh",
    handler: (ctx) => {
      const admin = requireRefreshSession(ctx)
      if (admin instanceof Response) return admin
      const session = issueSession(admin.id)
      const response: AdminRefreshResponse = {
        accessToken: session.accessToken,
        expiresIn: ACCESS_TOKEN_TTL_S,
        csrfToken: session.csrfToken,
      }
      return json(200, response, { headers: sessionCookies(session.refreshToken, session.csrfToken) })
    },
  },
  {
    method: "POST",
    path: "/admin/auth/logout",
    handler: (ctx) => {
      const admin = requireRefreshSession(ctx)
      if (admin instanceof Response) return admin
      return noContent(expiredCookies())
    },
  },
  {
    method: "GET",
    path: "/admin/me",
    handler: (ctx) => {
      const admin = requireAdmin(ctx)
      if (admin instanceof Response) return admin
      const profile: AdminProfile = {
        id: admin.id,
        nome: admin.nome,
        email: admin.email,
        papel: admin.papel,
        mfaAtivo: admin.mfaAtivo,
      }
      return json(200, profile)
    },
  },
  {
    method: "GET",
    path: "/admin/auditoria",
    handler: (ctx) => {
      const admin = requireAdmin(ctx)
      if (admin instanceof Response) return admin
      const entries = [...getMockDb().audit].sort((a, b) => b.id - a.id)
      const page = paginate(entries, ctx.query, (entry) => entry.id, (entry) => entry)
      return page instanceof Response ? page : json(200, page)
    },
  },
]
