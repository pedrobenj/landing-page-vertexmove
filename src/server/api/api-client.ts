import "server-only"

import { API_ERROR_CODE } from "@/enums/api-error-code.enum"
import { env } from "@/lib/env"
import type { ApiErrorBody } from "@/types/api/api-error-body.interface"

import { ApiError, isApiError } from "./api-error"
import { getForwardHeaders } from "./client-ip"
import { getTransport } from "./transport"

export interface ApiFetchOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE"
  body?: unknown
  query?: Record<string, string | number | undefined | null>
  headers?: Record<string, string>
  /** Repassa IP/UA do atleta (rate limit do backend). Padrão: true */
  forwardClient?: boolean
}

export interface ApiResult<T> {
  data: T
  headers: Headers
  status: number
}

function buildUrl(path: string, query: ApiFetchOptions["query"]): string {
  const base = env.API_URL.replace(/\/+$/, "")
  const url = new URL(`${base}/api/v1${path}`)
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value))
  }
  return url.toString()
}

function isTimeout(error: unknown): boolean {
  return error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")
}

function parseBody<T>(text: string, status: number): T {
  if (!text) return undefined as T
  try {
    return JSON.parse(text) as T
  } catch {
    throw new ApiError(status, API_ERROR_CODE.UNKNOWN, "Resposta inválida da API.")
  }
}

async function toApiError(res: Response): Promise<ApiError> {
  let body: Partial<ApiErrorBody> | undefined
  try {
    body = (await res.json()) as Partial<ApiErrorBody>
  } catch {
    body = undefined
  }
  return new ApiError(
    res.status,
    body?.error?.codigo ?? API_ERROR_CODE.UNKNOWN,
    body?.error?.mensagem ?? res.statusText,
  )
}

/** Chamada à API VertexMove. Nunca loga corpos de request/response (LGPD). */
export async function apiFetchRaw<T>(path: string, options: ApiFetchOptions = {}): Promise<ApiResult<T>> {
  const { method = "GET", body, query, forwardClient = true } = options
  const hasBody = body !== undefined

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(hasBody ? { "Content-Type": "application/json" } : {}),
    ...(forwardClient ? await getForwardHeaders() : {}),
    ...options.headers,
  }

  const transport = await getTransport()
  try {
    const res = await transport(buildUrl(path, query), {
      method,
      headers,
      body: hasBody ? JSON.stringify(body) : undefined,
      // O cache das listas públicas é feito por "use cache" nos endpoints, nunca pelo fetch.
      cache: "no-store",
      signal: AbortSignal.timeout(env.API_TIMEOUT_MS),
    })

    if (!res.ok) throw await toApiError(res)

    // A leitura do corpo também pode estourar o timeout ou cair a conexão: fica dentro do try.
    const text = res.status === 204 ? "" : await res.text()
    return { data: parseBody<T>(text, res.status), headers: res.headers, status: res.status }
  } catch (error) {
    if (isApiError(error)) throw error
    if (isTimeout(error)) {
      throw new ApiError(504, API_ERROR_CODE.TIMEOUT, "A API demorou demais para responder.")
    }
    if (error instanceof TypeError) {
      throw new ApiError(503, API_ERROR_CODE.UNAVAILABLE, "Não foi possível conectar à API.")
    }
    throw error
  }
}

export async function apiFetch<T>(path: string, options?: ApiFetchOptions): Promise<T> {
  return (await apiFetchRaw<T>(path, options)).data
}
