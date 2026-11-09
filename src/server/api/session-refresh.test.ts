import { beforeEach, describe, expect, it, vi } from "vitest"

import type { Transport } from "./transport"

const mockEnv = vi.hoisted(() => ({ NODE_ENV: "test", API_URL: "http://api.test", API_TIMEOUT_MS: 5_000, USE_MOCK_API: true }))
const override = vi.hoisted(() => ({ transport: null as Transport | null }))

vi.mock("@/lib/env", () => ({ env: mockEnv }))
vi.mock("next/headers", () => ({ headers: async () => new Headers(), cookies: async () => new Map() }))
vi.mock("./transport", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./transport")>()
  return { getTransport: async () => override.transport ?? actual.getTransport() }
})

const { refreshSession } = await import("./session-refresh")
const { loginRequest } = await import("./endpoints/admin-auth")
const { parseSetCookies } = await import("./set-cookie-parser")
const { resetMockDb } = await import("./mocks/mock-db")

async function login(): Promise<{ refreshToken: string; csrfToken: string }> {
  const { data, headers } = await loginRequest("admin@example.com", "Vertex@Dev12345")
  return { refreshToken: parseSetCookies(headers).vm_admin_rt.value, csrfToken: data.csrfToken }
}

describe("refreshSession", () => {
  beforeEach(() => {
    resetMockDb()
    override.transport = null
  })

  it("renova a sessão com refresh token e csrf válidos", async () => {
    const { refreshToken, csrfToken } = await login()

    const tokens = await refreshSession(refreshToken, csrfToken)

    expect(tokens).not.toBeNull()
    expect(tokens!.accessToken).toMatch(/^mock-at\./)
    expect(tokens!.expiresIn).toBe(900)
    expect(tokens!.refreshToken).toMatch(/^mock-rt\./)
    expect(tokens!.refreshToken).not.toBe(refreshToken)
    expect(tokens!.refreshMaxAge).toBe(604_800)
    expect(tokens!.csrfToken).not.toBe(csrfToken)
  })

  it("devolve null com csrf errado", async () => {
    const { refreshToken } = await login()

    await expect(refreshSession(refreshToken, "csrf-errado")).resolves.toBeNull()
  })

  it("devolve null com refresh token inválido", async () => {
    const { csrfToken } = await login()

    await expect(refreshSession("mock-rt.invalido", csrfToken)).resolves.toBeNull()
  })

  it("devolve null se a API cair", async () => {
    const { refreshToken, csrfToken } = await login()
    override.transport = async () => {
      throw new TypeError("fetch failed")
    }

    await expect(refreshSession(refreshToken, csrfToken)).resolves.toBeNull()
  })

  it("devolve null se o backend não mandar o refresh token no Set-Cookie", async () => {
    const { refreshToken, csrfToken } = await login()
    override.transport = async () => Response.json({ accessToken: "a", expiresIn: 900, csrfToken: "c" })

    await expect(refreshSession(refreshToken, csrfToken)).resolves.toBeNull()
  })
})
