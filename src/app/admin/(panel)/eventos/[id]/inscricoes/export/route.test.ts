import { NextRequest } from "next/server"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { ApiError } from "@/server/api/api-error"

const mocks = vi.hoisted(() => ({ streamAdminRegistrationsCsv: vi.fn() }))
vi.mock("next/navigation", () => ({ unstable_rethrow: () => {} }))
vi.mock("@/server/api/endpoints/admin-registrations", () => ({ streamAdminRegistrationsCsv: mocks.streamAdminRegistrationsCsv }))

const { GET } = await import("./route")

function request(headers: Record<string, string> = {}) {
  return new NextRequest("http://localhost:3001/admin/eventos/1/inscricoes/export", { headers })
}

const context = (id: string) => ({ params: Promise.resolve({ id }) })

describe("GET /admin/eventos/[id]/inscricoes/export", () => {
  beforeEach(() => vi.clearAllMocks())

  it("repassa o CSV do backend em streaming, sem cache", async () => {
    mocks.streamAdminRegistrationsCsv.mockResolvedValue(
      new Response("﻿Código;Nome\r\n", {
        headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="inscricoes-evento-1.csv"' },
      }),
    )
    const res = await GET(request(), context("1"))
    expect(mocks.streamAdminRegistrationsCsv).toHaveBeenCalledWith(1)
    expect(res.status).toBe(200)
    expect(res.headers.get("Content-Type")).toBe("text/csv; charset=utf-8")
    expect(res.headers.get("Content-Disposition")).toBe('attachment; filename="inscricoes-evento-1.csv"')
    expect(res.headers.get("Cache-Control")).toBe("no-store")
    expect(res.headers.get("Authorization")).toBeNull()
    expect(await res.text()).toContain("Código;Nome")
  })

  it("sem Content-Disposition do backend, usa um nome padrão", async () => {
    mocks.streamAdminRegistrationsCsv.mockResolvedValue(new Response("a", { headers: { "Content-Type": "text/csv" } }))
    const res = await GET(request(), context("7"))
    expect(res.headers.get("Content-Disposition")).toBe('attachment; filename="inscricoes-corrida-7.csv"')
  })

  it("id inválido → 404 sem chamar a API", async () => {
    expect((await GET(request(), context("abc"))).status).toBe(404)
    expect(mocks.streamAdminRegistrationsCsv).not.toHaveBeenCalled()
  })

  it("vindo de outro site → 403", async () => {
    expect((await GET(request({ "sec-fetch-site": "cross-site" }), context("1"))).status).toBe(403)
    expect(mocks.streamAdminRegistrationsCsv).not.toHaveBeenCalled()
  })

  it("erros da API viram status sem corpo sensível", async () => {
    mocks.streamAdminRegistrationsCsv.mockRejectedValue(new ApiError(404, "RECURSO_NAO_ENCONTRADO", "x"))
    expect((await GET(request(), context("1"))).status).toBe(404)
    mocks.streamAdminRegistrationsCsv.mockRejectedValue(new ApiError(503, "INDISPONIVEL", "x"))
    expect((await GET(request(), context("1"))).status).toBe(502)
  })
})
