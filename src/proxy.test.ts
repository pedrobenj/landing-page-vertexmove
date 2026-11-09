import { NextRequest } from "next/server"
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { SessionTokens } from "@/server/api/admin-session"

const mocks = vi.hoisted(() => ({ refreshSession: vi.fn() }))

vi.mock("next/headers", () => ({ cookies: async () => new Map(), headers: async () => new Headers() }))
vi.mock("@/server/api/session-refresh", () => ({ refreshSession: mocks.refreshSession }))

const { default: proxy } = await import("./proxy")
const { resetRefreshSingleFlight } = await import("@/server/api/session-refresh-single-flight")

const newTokens: SessionTokens = {
  accessToken: "at-novo",
  expiresIn: 900,
  refreshToken: "rt-novo",
  refreshMaxAge: 3600,
  csrfToken: "csrf-novo",
}

function request(path: string, cookie?: string) {
  return new NextRequest(`http://localhost:3001${path}`, { headers: cookie ? { cookie } : {} })
}

describe("proxy", () => {
  beforeEach(() => {
    mocks.refreshSession.mockReset()
    resetRefreshSingleFlight()
  })

  it("deixa passar /admin/login e /admin/sair sem checar cookie", async () => {
    for (const path of ["/admin/login", "/admin/sair"]) {
      const response = await proxy(request(path))
      expect(response.headers.get("x-middleware-next")).toBe("1")
    }
    expect(mocks.refreshSession).not.toHaveBeenCalled()
  })

  it("com access token presente, só segue", async () => {
    const response = await proxy(request("/admin", "vm_admin_at=at; vm_admin_rt=rt; vm_admin_csrf=csrf"))

    expect(response.headers.get("x-middleware-next")).toBe("1")
    expect(response.cookies.getAll()).toEqual([])
    expect(mocks.refreshSession).not.toHaveBeenCalled()
  })

  it("sem refresh token, redireciona ao login", async () => {
    const response = await proxy(request("/admin/loja/produtos"))

    expect(response.status).toBe(307)
    expect(response.headers.get("location")).toBe("http://localhost:3001/admin/login")
    expect(mocks.refreshSession).not.toHaveBeenCalled()
  })

  it("com só um dos cookies (rt sem csrf), redireciona e limpa", async () => {
    const response = await proxy(request("/admin", "vm_admin_rt=rt"))

    expect(response.headers.get("location")).toBe("http://localhost:3001/admin/login")
    expect(response.cookies.get("vm_admin_rt")).toMatchObject({ value: "", maxAge: 0 })
  })

  it("renova: atualiza o cookie da própria requisição e grava Set-Cookie na resposta", async () => {
    mocks.refreshSession.mockResolvedValue(newTokens)
    const req = request("/admin", "vm_admin_rt=rt-velho; vm_admin_csrf=csrf-velho")

    const response = await proxy(req)

    expect(mocks.refreshSession).toHaveBeenCalledWith("rt-velho", "csrf-velho", expect.any(Object))
    expect(response.headers.get("x-middleware-next")).toBe("1")
    // O Server Component da mesma requisição já lê o token novo.
    const forwardedCookie = response.headers.get("x-middleware-request-cookie") ?? ""
    expect(forwardedCookie).toContain("vm_admin_at=at-novo")
    expect(forwardedCookie).toContain("vm_admin_rt=rt-novo")
    expect(forwardedCookie).toContain("vm_admin_csrf=csrf-novo")
    expect(response.cookies.get("vm_admin_at")).toMatchObject({ value: "at-novo", maxAge: 840, httpOnly: true })
    expect(response.cookies.get("vm_admin_rt")).toMatchObject({ value: "rt-novo", maxAge: 3600 })
    expect(response.cookies.get("vm_admin_csrf")).toMatchObject({ value: "csrf-novo", maxAge: 3600 })
  })

  it("refresh falho: limpa os cookies e redireciona ao login", async () => {
    mocks.refreshSession.mockResolvedValue(null)

    const response = await proxy(request("/admin", "vm_admin_rt=rt; vm_admin_csrf=csrf"))

    expect(response.status).toBe(307)
    expect(response.headers.get("location")).toBe("http://localhost:3001/admin/login")
    for (const name of ["vm_admin_at", "vm_admin_rt", "vm_admin_csrf"]) {
      expect(response.cookies.get(name)).toMatchObject({ value: "", maxAge: 0 })
    }
  })

  it("requisições concorrentes com o mesmo refresh token fazem um único refresh e recebem o mesmo par", async () => {
    let resolveRefresh: (tokens: SessionTokens) => void = () => {}
    mocks.refreshSession.mockReturnValue(new Promise<SessionTokens>((resolve) => (resolveRefresh = resolve)))
    const cookie = "vm_admin_rt=rt-compartilhado; vm_admin_csrf=csrf"

    const pending = Promise.all([proxy(request("/admin", cookie)), proxy(request("/admin/loja/produtos", cookie))])
    resolveRefresh(newTokens)
    const responses = await pending

    expect(mocks.refreshSession).toHaveBeenCalledTimes(1)
    for (const response of responses) expect(response.cookies.get("vm_admin_rt")?.value).toBe("rt-novo")

    // Logo depois (ex.: outra aba com o cookie antigo), reaproveita o par do cache em vez de reusar o token rotacionado.
    const late = await proxy(request("/admin", cookie))
    expect(mocks.refreshSession).toHaveBeenCalledTimes(1)
    expect(late.cookies.get("vm_admin_at")?.value).toBe("at-novo")
  })

  it("refresh falho não fica em cache: a próxima tentativa chama a API de novo", async () => {
    mocks.refreshSession.mockResolvedValueOnce(null).mockResolvedValueOnce(newTokens)
    const cookie = "vm_admin_rt=rt; vm_admin_csrf=csrf"

    await proxy(request("/admin", cookie))
    const response = await proxy(request("/admin", cookie))

    expect(mocks.refreshSession).toHaveBeenCalledTimes(2)
    expect(response.cookies.get("vm_admin_at")?.value).toBe("at-novo")
  })
})
