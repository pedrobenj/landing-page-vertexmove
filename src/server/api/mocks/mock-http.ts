import "server-only"

import type { ApiErrorBody } from "@/types/api/api-error-body.interface"

/** Contexto entregue a cada handler do mock. */
export interface MockContext {
  params: Record<string, string>
  query: URLSearchParams
  body: unknown
  headers: Headers
  cookies: Record<string, string>
}

export type MockHandler = (ctx: MockContext) => Response | Promise<Response>

export interface MockRoute {
  method: "GET" | "POST" | "PATCH" | "DELETE"
  /** Caminho sem `/api/v1`; segmentos `:nome` viram `ctx.params.nome` (ex.: `/eventos/:slug`). */
  path: string
  handler: MockHandler
}

export function json(status: number, body: unknown, init: { headers?: Headers } = {}): Response {
  const headers = init.headers ?? new Headers()
  headers.set("Content-Type", "application/json")
  return new Response(JSON.stringify(body), { status, headers })
}

export function noContent(headers?: Headers): Response {
  return new Response(null, { status: 204, headers })
}

export function apiError(status: number, codigo: string, mensagem: string): Response {
  const body: ApiErrorBody = { error: { codigo, mensagem } }
  return json(status, body)
}

export function parseCookies(header: string | null): Record<string, string> {
  const cookies: Record<string, string> = {}
  for (const part of (header ?? "").split(";")) {
    const index = part.indexOf("=")
    if (index <= 0) continue
    cookies[part.slice(0, index).trim()] = decodeURIComponent(part.slice(index + 1).trim())
  }
  return cookies
}

/** Casa `path` (com segmentos `:nome`) contra o caminho real; devolve os params ou `null`. */
export function matchPath(template: string, actual: string): Record<string, string> | null {
  const expected = template.split("/")
  const received = actual.split("/")
  if (expected.length !== received.length) return null
  const params: Record<string, string> = {}
  for (const [index, segment] of expected.entries()) {
    const value = received[index]
    if (segment.startsWith(":")) {
      if (!value) return null
      params[segment.slice(1)] = decodeURIComponent(value)
    } else if (segment !== value) {
      return null
    }
  }
  return params
}
