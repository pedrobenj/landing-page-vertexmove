import { beforeEach, describe, expect, it, vi } from "vitest"

const transport = vi.fn<(url: string, init: RequestInit) => Promise<Response>>()
const cookieJar = vi.hoisted(() => ({ token: undefined as string | undefined, set: vi.fn() }))

vi.mock("@/lib/env", () => ({ env: { API_URL: "http://api.test", API_TIMEOUT_MS: 5_000, USE_MOCK_API: false } }))
vi.mock("./transport", () => ({ getTransport: async () => transport }))
vi.mock("next/headers", () => ({
  headers: async () => new Headers(),
  cookies: async () => ({
    get: (name: string) => (name === "vm_admin_at" && cookieJar.token ? { name, value: cookieJar.token } : undefined),
    set: cookieJar.set,
  }),
}))
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`)
  },
  unstable_rethrow: () => {},
}))

const { adminFetch } = await import("./admin-fetch")

describe("adminFetch", () => {
  beforeEach(() => {
    transport.mockReset()
    cookieJar.token = undefined
    cookieJar.set.mockReset()
  })

  it("redireciona ao login sem token", async () => {
    await expect(adminFetch("/admin/me")).rejects.toThrow("REDIRECT:/admin/login")
    expect(transport).not.toHaveBeenCalled()
  })

  it("envia o Bearer do cookie", async () => {
    cookieJar.token = "abc"
    transport.mockResolvedValue(Response.json({ id: 1 }))

    await expect(adminFetch("/admin/me")).resolves.toEqual({ id: 1 })
    expect(new Headers(transport.mock.calls[0][1].headers).get("Authorization")).toBe("Bearer abc")
  })

  it("em 401 da API redireciona à rota que apaga a sessão", async () => {
    cookieJar.token = "expirado"
    transport.mockResolvedValue(Response.json({ error: { codigo: "NAO_AUTENTICADO", mensagem: "x" } }, { status: 401 }))

    await expect(adminFetch("/admin/me")).rejects.toThrow("REDIRECT:/admin/sair")
  })

  it("em 401 tenta apagar a sessão antes do redirect (funciona em server actions)", async () => {
    cookieJar.token = "expirado"
    transport.mockResolvedValue(Response.json({ error: { codigo: "NAO_AUTENTICADO", mensagem: "x" } }, { status: 401 }))

    await expect(adminFetch("/admin/me")).rejects.toThrow("REDIRECT:/admin/sair")
    expect(cookieJar.set.mock.calls.map(([name, value]) => [name, value])).toEqual([
      ["vm_admin_at", ""],
      ["vm_admin_rt", ""],
      ["vm_admin_csrf", ""],
    ])
  })

  it("em 401 redireciona mesmo se não puder apagar cookies (Server Component)", async () => {
    cookieJar.token = "expirado"
    cookieJar.set.mockImplementation(() => {
      throw new Error("Cookies can only be modified in a Server Action or Route Handler")
    })
    transport.mockResolvedValue(Response.json({ error: { codigo: "NAO_AUTENTICADO", mensagem: "x" } }, { status: 401 }))

    await expect(adminFetch("/admin/me")).rejects.toThrow("REDIRECT:/admin/sair")
  })

  it("relança outros erros da API", async () => {
    cookieJar.token = "abc"
    transport.mockResolvedValue(Response.json({ error: { codigo: "ACESSO_NEGADO", mensagem: "x" } }, { status: 403 }))

    await expect(adminFetch("/admin/eventos")).rejects.toMatchObject({ status: 403, codigo: "ACESSO_NEGADO" })
  })
})
