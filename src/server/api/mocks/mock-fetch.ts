import "server-only"

import { API_ERROR_CODE } from "@/enums/api-error-code.enum"
import { env } from "@/lib/env"

import type { Transport } from "../transport"
import { apiError, matchPath, type MockContext, parseCookies } from "./mock-http"
import { mockRoutes } from "./mock-routes"

const API_PREFIX = "/api/v1"
const MIN_DELAY_MS = 150
const MAX_DELAY_MS = 300

/** Atraso de rede simulado, para os skeletons aparecerem. Pulado nos testes. */
async function simulateLatency(signal: AbortSignal | null | undefined): Promise<void> {
  if (env.NODE_ENV === "test") return
  const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS)
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, delay)
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer)
        reject(signal.reason)
      },
      { once: true },
    )
  })
}

function parseBody(body: RequestInit["body"]): { ok: true; value: unknown } | { ok: false } {
  if (body === undefined || body === null) return { ok: true, value: undefined }
  if (typeof body !== "string") return { ok: false }
  try {
    return { ok: true, value: JSON.parse(body) }
  } catch {
    return { ok: false }
  }
}

/**
 * `fetch` falso da API VertexMove (`USE_MOCK_API=true`): mesmas rotas, status, corpos,
 * `Set-Cookie` e erros `{ error: { codigo, mensagem } }` do contrato, com estado em memória.
 */
export const mockFetch: Transport = async (input, init) => {
  const url = new URL(input)
  const path = url.pathname.startsWith(API_PREFIX) ? url.pathname.slice(API_PREFIX.length) : url.pathname
  const method = (init.method ?? "GET").toUpperCase()

  await simulateLatency(init.signal)

  const body = parseBody(init.body)
  if (!body.ok) return apiError(400, API_ERROR_CODE.INVALID_DATA, "Corpo da requisição não é JSON válido.")

  const headers = new Headers(init.headers)
  for (const route of mockRoutes) {
    if (route.method !== method) continue
    const params = matchPath(route.path, path)
    if (!params) continue
    const ctx: MockContext = {
      params,
      query: url.searchParams,
      body: body.value,
      headers,
      cookies: parseCookies(headers.get("Cookie")),
    }
    return route.handler(ctx)
  }
  return apiError(404, API_ERROR_CODE.NOT_FOUND, `Rota ${method} ${path} não existe.`)
}
