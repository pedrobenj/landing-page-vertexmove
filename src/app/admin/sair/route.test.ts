import { NextRequest } from "next/server"
import { describe, expect, it, vi } from "vitest"

vi.mock("next/headers", () => ({ cookies: async () => new Map() }))

const { GET } = await import("./route")

function request(headers: Record<string, string> = {}) {
  return new NextRequest("http://localhost:3001/admin/sair", {
    headers: { cookie: "vm_admin_at=at; vm_admin_rt=rt; vm_admin_csrf=csrf", ...headers },
  })
}

describe("GET /admin/sair", () => {
  it("apaga os cookies e vai ao login com o aviso de sessão expirada, sem cache", () => {
    const response = GET(request({ "sec-fetch-site": "same-origin" }))

    expect(response.status).toBe(307)
    expect(response.headers.get("location")).toBe("http://localhost:3001/admin/login?expirada=1")
    expect(response.headers.get("cache-control")).toBe("no-store")
    for (const name of ["vm_admin_at", "vm_admin_rt", "vm_admin_csrf"]) {
      expect(response.cookies.get(name)).toMatchObject({ value: "", maxAge: 0 })
    }
  })

  it("sem Sec-Fetch-Site (navegação direta, browsers antigos) também apaga", () => {
    const response = GET(request())
    expect(response.cookies.get("vm_admin_rt")).toMatchObject({ value: "", maxAge: 0 })
  })

  it("requisição cross-site não apaga a sessão (evita logout forjado)", () => {
    const response = GET(request({ "sec-fetch-site": "cross-site" }))

    expect(response.status).toBe(307)
    expect(response.headers.get("location")).toBe("http://localhost:3001/admin/login?expirada=1")
    expect(response.headers.get("cache-control")).toBe("no-store")
    expect(response.cookies.getAll()).toEqual([])
  })
})
