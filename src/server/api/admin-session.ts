import "server-only"

import { cookies } from "next/headers"
import type { NextResponse } from "next/server"

import type { ParsedSetCookie } from "./set-cookie-parser"

export const SESSION_COOKIES = { access: "vm_admin_at", refresh: "vm_admin_rt", csrf: "vm_admin_csrf" } as const
/** Renova antes de expirar: o cookie do access token vive (expiresIn - 60) s. */
export const ACCESS_TOKEN_SAFETY_MARGIN_S = 60
const MIN_ACCESS_COOKIE_MAX_AGE_S = 30
/** Validade do refresh token quando o backend não manda `Max-Age`/`Expires` (7 dias). */
export const DEFAULT_REFRESH_MAX_AGE_S = 604_800

export interface SessionTokens {
  accessToken: string
  expiresIn: number
  refreshToken: string
  refreshMaxAge: number
  csrfToken: string
}

export interface SessionCookieValues {
  accessToken?: string
  refreshToken?: string
  csrfToken?: string
}

interface TokenResponseBody {
  accessToken: string
  expiresIn: number
  csrfToken: string
}

export interface SessionCookieOptions {
  httpOnly: true
  secure: boolean
  sameSite: "lax"
  path: "/"
  maxAge: number
}

/** Todos HttpOnly; `secure` só em produção (em `http://localhost` o browser recusaria o cookie). */
export function sessionCookieOptions(maxAge: number): SessionCookieOptions {
  return { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge }
}

export function accessCookieMaxAge(expiresIn: number): number {
  return Math.max(expiresIn - ACCESS_TOKEN_SAFETY_MARGIN_S, MIN_ACCESS_COOKIE_MAX_AGE_S)
}

/**
 * Junta o corpo do login/refresh com o `vm_admin_rt` do `Set-Cookie` do backend.
 * `null` se o backend não mandou o refresh token (sessão impossível de renovar).
 */
export function toSessionTokens(
  body: TokenResponseBody,
  setCookies: Record<string, ParsedSetCookie>,
): SessionTokens | null {
  const refresh = setCookies[SESSION_COOKIES.refresh]
  // `Max-Age=0` é o backend apagando o cookie: também não há sessão.
  if (!body?.accessToken || !body.csrfToken || !refresh?.value || refresh.maxAge === 0) return null
  return {
    accessToken: body.accessToken,
    expiresIn: body.expiresIn,
    refreshToken: refresh.value,
    refreshMaxAge: refresh.maxAge ?? DEFAULT_REFRESH_MAX_AGE_S,
    csrfToken: body.csrfToken,
  }
}

function sessionEntries(tokens: SessionTokens): [string, string, SessionCookieOptions][] {
  return [
    [SESSION_COOKIES.access, tokens.accessToken, sessionCookieOptions(accessCookieMaxAge(tokens.expiresIn))],
    [SESSION_COOKIES.refresh, tokens.refreshToken, sessionCookieOptions(tokens.refreshMaxAge)],
    [SESSION_COOKIES.csrf, tokens.csrfToken, sessionCookieOptions(tokens.refreshMaxAge)],
  ]
}

/** Grava os três cookies. Só em server actions e route handlers (Server Components não gravam cookies). */
export async function writeSession(tokens: SessionTokens): Promise<void> {
  const store = await cookies()
  for (const [name, value, options] of sessionEntries(tokens)) store.set(name, value, options)
}

export async function readSession(): Promise<SessionCookieValues> {
  const store = await cookies()
  return {
    accessToken: store.get(SESSION_COOKIES.access)?.value,
    refreshToken: store.get(SESSION_COOKIES.refresh)?.value,
    csrfToken: store.get(SESSION_COOKIES.csrf)?.value,
  }
}

export async function getAccessToken(): Promise<string | null> {
  return (await readSession()).accessToken ?? null
}

/** Apaga os três cookies. Só em server actions e route handlers. */
export async function clearSession(): Promise<void> {
  const store = await cookies()
  for (const name of Object.values(SESSION_COOKIES)) store.set(name, "", sessionCookieOptions(0))
}

/** Versão do `writeSession` para o `proxy.ts`, que grava na resposta. */
export function applySessionToResponse(res: NextResponse, tokens: SessionTokens): void {
  for (const [name, value, options] of sessionEntries(tokens)) res.cookies.set(name, value, options)
}

/** Versão do `clearSession` para o `proxy.ts` e route handlers que devolvem a própria resposta. */
export function clearSessionOnResponse(res: NextResponse): void {
  for (const name of Object.values(SESSION_COOKIES)) res.cookies.set(name, "", sessionCookieOptions(0))
}
