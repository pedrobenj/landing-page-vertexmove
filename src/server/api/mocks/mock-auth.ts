import "server-only"

import { randomUUID } from "node:crypto"

/**
 * Tokens SEM estado e verificáveis: o `proxy.ts` pode rodar noutro contexto de módulo,
 * então nada de sessões guardadas no mock-db.
 */
export const ACCESS_TOKEN_TTL_S = 900
export const REFRESH_TOKEN_TTL_S = 604_800

const ACCESS_PREFIX = "mock-at."
const REFRESH_PREFIX = "mock-rt."
const CSRF_PREFIX = "mock-csrf."

interface TokenPayload {
  adminId: number
  exp: number // epoch em segundos
  jti?: string
}

export interface MockSession {
  accessToken: string
  refreshToken: string
  csrfToken: string
}

function encode(payload: TokenPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64url")
}

function decode(token: string | null | undefined, prefix: string): TokenPayload | null {
  if (!token?.startsWith(prefix)) return null
  try {
    const payload = JSON.parse(Buffer.from(token.slice(prefix.length), "base64url").toString("utf8")) as Partial<TokenPayload>
    if (typeof payload.adminId !== "number" || typeof payload.exp !== "number") return null
    return payload.exp > Date.now() / 1000 ? { adminId: payload.adminId, exp: payload.exp, jti: payload.jti } : null
  } catch {
    return null
  }
}

function nowSeconds(): number {
  return Math.floor(Date.now() / 1000)
}

export function issueSession(adminId: number): MockSession {
  return {
    accessToken: ACCESS_PREFIX + encode({ adminId, exp: nowSeconds() + ACCESS_TOKEN_TTL_S }),
    refreshToken: REFRESH_PREFIX + encode({ adminId, exp: nowSeconds() + REFRESH_TOKEN_TTL_S, jti: randomUUID() }),
    csrfToken: CSRF_PREFIX + randomUUID(),
  }
}

/** `adminId` do access token, ou `null` se inválido/expirado. */
export function readAccessToken(token: string | null | undefined): number | null {
  return decode(token, ACCESS_PREFIX)?.adminId ?? null
}

/** `adminId` do refresh token, ou `null` se inválido/expirado. */
export function readRefreshToken(token: string | null | undefined): number | null {
  return decode(token, REFRESH_PREFIX)?.adminId ?? null
}

/** Lê o `Authorization: Bearer <token>`. */
export function readBearer(headers: Headers): number | null {
  const [scheme, token] = (headers.get("Authorization") ?? "").split(" ")
  return scheme === "Bearer" ? readAccessToken(token) : null
}
