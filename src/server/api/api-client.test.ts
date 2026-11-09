import { beforeEach, describe, expect, it, vi } from "vitest"

const transport = vi.fn<(url: string, init: RequestInit) => Promise<Response>>()

vi.mock("@/lib/env", () => ({
  env: { API_URL: "http://api.test", API_TIMEOUT_MS: 5_000, USE_MOCK_API: false },
}))
vi.mock("./transport", () => ({ getTransport: async () => transport }))
vi.mock("next/headers", () => ({
  headers: async () =>
    new Headers({ "x-forwarded-for": "203.0.113.5, 10.0.0.1", "user-agent": "Mozilla/5.0 Teste" }),
}))

const { apiFetch, apiFetchRaw } = await import("./api-client")
const { ApiError, isApiError } = await import("./api-error")

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } })
}

function lastCall(): { url: string; init: RequestInit; headers: Headers } {
  const [url, init] = transport.mock.calls.at(-1)!
  return { url, init, headers: new Headers(init.headers) }
}

async function catchError(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise
  } catch (error) {
    return error
  }
  throw new Error("esperava que a promise rejeitasse")
}

describe("apiFetch", () => {
  beforeEach(() => {
    transport.mockReset()
  })

  it("monta a URL com /api/v1 e a query sem valores vazios", async () => {
    transport.mockResolvedValue(jsonResponse(200, { items: [], nextCursor: null }))

    await apiFetch("/eventos", { query: { limit: 20, cursor: undefined, status: null, q: "beira mar" } })

    const { url, init, headers } = lastCall()
    expect(url).toBe("http://api.test/api/v1/eventos?limit=20&q=beira+mar")
    expect(init.method).toBe("GET")
    expect(init.cache).toBe("no-store")
    expect(init.signal).toBeInstanceOf(AbortSignal)
    expect(headers.get("Accept")).toBe("application/json")
    expect(headers.has("Content-Type")).toBe(false)
  })

  it("envia o body como JSON e devolve os dados", async () => {
    transport.mockResolvedValue(jsonResponse(201, { codigo: "VX-2026-00000001" }))

    const data = await apiFetch<{ codigo: string }>("/inscricoes", { method: "POST", body: { distanciaId: 1 } })

    const { init, headers } = lastCall()
    expect(data).toEqual({ codigo: "VX-2026-00000001" })
    expect(init.method).toBe("POST")
    expect(init.body).toBe('{"distanciaId":1}')
    expect(headers.get("Content-Type")).toBe("application/json")
  })

  it("devolve status e headers no apiFetchRaw", async () => {
    transport.mockResolvedValue(
      new Response("{}", { status: 201, headers: { Location: "/api/v1/admin/eventos/9" } }),
    )

    const result = await apiFetchRaw("/admin/eventos", { method: "POST", body: {} })

    expect(result.status).toBe(201)
    expect(result.headers.get("Location")).toBe("/api/v1/admin/eventos/9")
  })

  it("devolve undefined em 204", async () => {
    transport.mockResolvedValue(new Response(null, { status: 204 }))

    await expect(apiFetch("/admin/eventos/1", { method: "DELETE" })).resolves.toBeUndefined()
  })

  it("converte o corpo de erro da API em ApiError", async () => {
    transport.mockResolvedValue(
      jsonResponse(409, { error: { codigo: "INSCRICAO_DUPLICADA", mensagem: "Inscrição duplicada" } }),
    )

    const error = await catchError(apiFetch("/inscricoes", { method: "POST", body: {} }))

    expect(error).toBeInstanceOf(ApiError)
    expect(isApiError(error)).toBe(true)
    expect(error).toMatchObject({ status: 409, codigo: "INSCRICAO_DUPLICADA", mensagem: "Inscrição duplicada" })
  })

  it("usa DESCONHECIDO quando o corpo de erro não é JSON", async () => {
    transport.mockResolvedValue(new Response("<html>Bad Gateway</html>", { status: 502, statusText: "Bad Gateway" }))

    const error = await catchError(apiFetch("/eventos"))

    expect(error).toMatchObject({ status: 502, codigo: "DESCONHECIDO", mensagem: "Bad Gateway" })
  })

  it("converte timeout em ApiError TIMEOUT", async () => {
    transport.mockRejectedValue(new DOMException("The operation timed out.", "TimeoutError"))

    const error = await catchError(apiFetch("/eventos"))

    expect(error).toMatchObject({ status: 504, codigo: "TIMEOUT" })
  })

  it("converte falha de rede em ApiError INDISPONIVEL", async () => {
    transport.mockRejectedValue(new TypeError("fetch failed"))

    const error = await catchError(apiFetch("/eventos"))

    expect(error).toMatchObject({ status: 503, codigo: "INDISPONIVEL" })
  })

  it("repassa IP e User-Agent do cliente por padrão", async () => {
    transport.mockResolvedValue(jsonResponse(200, {}))

    await apiFetch("/inscricoes/consulta", { method: "POST", body: { cpf: "52998224725" } })

    const { headers } = lastCall()
    expect(headers.get("X-Forwarded-For")).toBe("203.0.113.5")
    expect(headers.get("User-Agent")).toBe("Mozilla/5.0 Teste")
  })

  it("não repassa IP com forwardClient: false", async () => {
    transport.mockResolvedValue(jsonResponse(200, {}))

    await apiFetch("/eventos", { forwardClient: false, headers: { Authorization: "Bearer x" } })

    const { headers } = lastCall()
    expect(headers.has("X-Forwarded-For")).toBe(false)
    expect(headers.get("Authorization")).toBe("Bearer x")
  })
})
