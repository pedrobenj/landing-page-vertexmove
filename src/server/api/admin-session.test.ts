import { describe, expect, it, vi } from "vitest"

vi.mock("next/headers", () => ({ cookies: async () => new Map() }))

const { accessCookieMaxAge, sessionCookieOptions, toSessionTokens } = await import("./admin-session")

const body = { accessToken: "at", expiresIn: 900, csrfToken: "csrf" }

describe("admin-session", () => {
  it("o cookie do access token expira 60 s antes do token, com mínimo de 30 s", () => {
    expect(accessCookieMaxAge(900)).toBe(840)
    expect(accessCookieMaxAge(70)).toBe(30)
  })

  it("cookies HttpOnly, SameSite=Lax, path / e não Secure fora de produção", () => {
    expect(sessionCookieOptions(10)).toEqual({ httpOnly: true, secure: false, sameSite: "lax", path: "/", maxAge: 10 })
  })

  it("junta o corpo com o refresh token do Set-Cookie", () => {
    expect(toSessionTokens(body, { vm_admin_rt: { value: "rt", maxAge: 3600 } })).toEqual({
      accessToken: "at",
      expiresIn: 900,
      refreshToken: "rt",
      refreshMaxAge: 3600,
      csrfToken: "csrf",
    })
  })

  it("usa 7 dias quando o Set-Cookie não traz validade", () => {
    expect(toSessionTokens(body, { vm_admin_rt: { value: "rt" } })?.refreshMaxAge).toBe(604_800)
  })

  it("devolve null sem refresh token", () => {
    expect(toSessionTokens(body, {})).toBeNull()
  })
})
