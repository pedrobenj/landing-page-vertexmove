import { beforeEach, describe, expect, it, vi } from "vitest"

import type { Transport } from "@/server/api/transport"

const mockEnv = vi.hoisted(() => ({ NODE_ENV: "test", API_URL: "http://api.test", API_TIMEOUT_MS: 5_000, USE_MOCK_API: true }))
const override = vi.hoisted(() => ({ transport: null as Transport | null }))
const jar = vi.hoisted(() => new Map<string, { value: string; maxAge?: number }>())

vi.mock("@/lib/env", () => ({ env: mockEnv }))
vi.mock("next/headers", () => ({
  headers: async () => new Headers(),
  cookies: async () => ({
    get: (name: string) => (jar.has(name) ? { name, value: jar.get(name)!.value } : undefined),
    set: (name: string, value: string, options: { maxAge?: number }) => {
      if (options.maxAge === 0) jar.delete(name)
      else jar.set(name, { value, maxAge: options.maxAge })
    },
  }),
}))
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`)
  },
  unstable_rethrow: () => {},
}))
vi.mock("@/server/api/transport", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/server/api/transport")>()
  return { getTransport: async () => override.transport ?? actual.getTransport() }
})

const { loginAdmin, logoutAdmin } = await import("./admin-auth")
const { resetMockDb } = await import("@/server/api/mocks/mock-db")

describe("loginAdmin", () => {
  beforeEach(() => {
    resetMockDb()
    jar.clear()
    override.transport = null
  })

  it("grava os três cookies e redireciona ao painel", async () => {
    await expect(loginAdmin({ email: "admin@example.com", senha: "Vertex@Dev12345" })).rejects.toThrow("REDIRECT:/admin")

    expect(jar.get("vm_admin_at")).toMatchObject({ maxAge: 840 })
    expect(jar.get("vm_admin_at")!.value).toMatch(/^mock-at\./)
    expect(jar.get("vm_admin_rt")).toMatchObject({ maxAge: 604_800 })
    expect(jar.get("vm_admin_csrf")!.value).toMatch(/^mock-csrf\./)
  })

  it("senha errada → 401 com mensagem amigável e sem cookies", async () => {
    const response = await loginAdmin({ email: "admin@example.com", senha: "errada" })

    expect(response).toMatchObject({ status: 401, code: "NAO_AUTENTICADO", error: "E-mail ou senha inválidos." })
    expect(jar.size).toBe(0)
  })

  it("conta com MFA → 403 MFA_NECESSARIO", async () => {
    const response = await loginAdmin({ email: "superadmin@example.com", senha: "Vertex@Dev12345" })

    expect(response).toMatchObject({
      status: 403,
      code: "MFA_NECESSARIO",
      error: "Esta conta exige verificação em duas etapas, ainda indisponível.",
    })
  })

  it("entrada inválida → 422 sem chamar a API", async () => {
    override.transport = vi.fn()

    const response = await loginAdmin({ email: "x", senha: "" })

    expect(response).toMatchObject({ status: 422, code: "DADO_INVALIDO" })
    expect(override.transport).not.toHaveBeenCalled()
  })

  it("faz uma única chamada à API (sem retry)", async () => {
    const transport = vi.fn<Transport>(async () => {
      throw new TypeError("fetch failed")
    })
    override.transport = transport

    const response = await loginAdmin({ email: "admin@example.com", senha: "Vertex@Dev12345" })

    expect(response).toMatchObject({ status: 503, code: "INDISPONIVEL" })
    expect(transport).toHaveBeenCalledTimes(1)
  })
})

describe("logoutAdmin", () => {
  beforeEach(() => {
    resetMockDb()
    jar.clear()
    override.transport = null
  })

  it("chama a API, limpa os cookies e vai ao login", async () => {
    await loginAdmin({ email: "admin@example.com", senha: "Vertex@Dev12345" }).catch(() => {})
    const transport = vi.fn<Transport>(async () => new Response(null, { status: 204 }))
    override.transport = transport

    await expect(logoutAdmin()).rejects.toThrow("REDIRECT:/admin/login")

    expect(transport.mock.calls[0][0]).toBe("http://api.test/api/v1/admin/auth/logout")
    expect(jar.size).toBe(0)
  })

  it("limpa os cookies mesmo se a API falhar", async () => {
    await loginAdmin({ email: "admin@example.com", senha: "Vertex@Dev12345" }).catch(() => {})
    override.transport = async () => Response.json({ error: { codigo: "NAO_AUTENTICADO", mensagem: "x" } }, { status: 401 })

    await expect(logoutAdmin()).rejects.toThrow("REDIRECT:/admin/login")
    expect(jar.size).toBe(0)
  })
})
