import { NextRequest } from "next/server"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { ApiError } from "@/server/api/api-error"

const mocks = vi.hoisted(() => ({ streamLgpdExport: vi.fn() }))
vi.mock("next/navigation", () => ({ unstable_rethrow: () => {} }))
vi.mock("@/server/api/endpoints/admin-lgpd", () => ({ streamLgpdExport: mocks.streamLgpdExport }))

const { GET } = await import("./route")

function request(headers: Record<string, string> = {}) {
  return new NextRequest("http://localhost:3001/admin/lgpd/3/exportacao", { headers })
}

const context = (id: string) => ({ params: Promise.resolve({ id }) })

describe("GET /admin/lgpd/[id]/exportacao", () => {
  beforeEach(() => vi.clearAllMocks())

  it("repassa o JSON do backend como anexo, sem cache e sem o Bearer", async () => {
    mocks.streamLgpdExport.mockResolvedValue(
      Response.json({ titular: { nomeCompleto: "Maria" } }, { headers: { "Content-Disposition": 'attachment; filename="titular-LGPD-2026-000003.json"' } }),
    )
    const res = await GET(request(), context("3"))
    expect(mocks.streamLgpdExport).toHaveBeenCalledWith(3)
    expect(res.status).toBe(200)
    expect(res.headers.get("Content-Type")).toContain("application/json")
    expect(res.headers.get("Content-Disposition")).toBe('attachment; filename="titular-LGPD-2026-000003.json"')
    expect(res.headers.get("Cache-Control")).toBe("no-store")
    expect(res.headers.get("Authorization")).toBeNull()
    expect(await res.json()).toEqual({ titular: { nomeCompleto: "Maria" } })
  })

  it("sem Content-Disposition do backend, usa um nome padrão (sempre anexo)", async () => {
    mocks.streamLgpdExport.mockResolvedValue(Response.json({}))
    const res = await GET(request(), context("9"))
    expect(res.headers.get("Content-Disposition")).toBe('attachment; filename="titular-solicitacao-9.json"')
  })

  it("id inválido → 404; outro site → 403; sem chamar a API", async () => {
    expect((await GET(request(), context("abc"))).status).toBe(404)
    expect((await GET(request({ "sec-fetch-site": "cross-site" }), context("3"))).status).toBe(403)
    expect(mocks.streamLgpdExport).not.toHaveBeenCalled()
  })

  it("erros da API viram status sem corpo sensível", async () => {
    mocks.streamLgpdExport.mockRejectedValue(new ApiError(404, "RECURSO_NAO_ENCONTRADO", "x"))
    expect((await GET(request(), context("3"))).status).toBe(404)
    mocks.streamLgpdExport.mockRejectedValue(new ApiError(503, "INDISPONIVEL", "detalhe-interno"))
    const res = await GET(request(), context("3"))
    expect(res.status).toBe(502)
    expect(await res.text()).not.toContain("detalhe-interno")
  })
})
