import { NextResponse } from "next/server"
import { afterEach, describe, expect, it, vi } from "vitest"

vi.mock("next/headers", () => ({ cookies: async () => new Map() }))

const { accessCookieMaxAge, applySessionToResponse, clearSessionOnResponse, sessionCookieOptions, toSessionTokens } =
  await import("./admin-session")

const body = { accessToken: "at", expiresIn: 900, csrfToken: "csrf" }
const tokens = { accessToken: "at", expiresIn: 900, refreshToken: "rt", refreshMaxAge: 3600, csrfToken: "csrf" }

describe("admin-session", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("o cookie do access token expira 60 s antes do token, ou na metade se o token for curto", () => {
    expect(accessCookieMaxAge(900)).toBe(840)
    expect(accessCookieMaxAge(100)).toBe(50)
    expect(accessCookieMaxAge(61)).toBe(30)
  })

  it("cookies HttpOnly, SameSite=Lax, path / e não Secure fora de produção", () => {
    expect(sessionCookieOptions(10)).toEqual({ httpOnly: true, secure: false, sameSite: "lax", path: "/", maxAge: 10 })
  })

  it("cookies Secure em produção", () => {
    vi.stubEnv("NODE_ENV", "production")
    expect(sessionCookieOptions(10).secure).toBe(true)
  })

  it("junta o corpo com o refresh token do Set-Cookie", () => {
    expect(toSessionTokens(body, { vm_admin_rt: { value: "rt", maxAge: 3600 } })).toEqual(tokens)
  })

  it.each([0, -5, Number.NaN, Number.POSITIVE_INFINITY, undefined, "900"])("expiresIn inválido (%s) vira 900 s", (value) => {
    const result = toSessionTokens({ ...body, expiresIn: value as number }, { vm_admin_rt: { value: "rt" } })
    expect(result?.expiresIn).toBe(900)
  })

  it("usa 7 dias quando o Set-Cookie não traz validade", () => {
    expect(toSessionTokens(body, { vm_admin_rt: { value: "rt" } })?.refreshMaxAge).toBe(604_800)
  })

  it("devolve null sem refresh token", () => {
    expect(toSessionTokens(body, {})).toBeNull()
  })

  it("applySessionToResponse grava os três cookies HttpOnly com a validade de cada um", () => {
    const response = NextResponse.next()
    applySessionToResponse(response, tokens)

    expect(response.cookies.get("vm_admin_at")).toMatchObject({ value: "at", maxAge: 840, httpOnly: true, sameSite: "lax", path: "/" })
    expect(response.cookies.get("vm_admin_rt")).toMatchObject({ value: "rt", maxAge: 3600, httpOnly: true })
    // O csrf acompanha o refresh token (sem ele o refresh não funciona).
    expect(response.cookies.get("vm_admin_csrf")).toMatchObject({ value: "csrf", maxAge: 3600, httpOnly: true })
  })

  it("clearSessionOnResponse zera os três cookies", () => {
    const response = NextResponse.next()
    clearSessionOnResponse(response)

    for (const name of ["vm_admin_at", "vm_admin_rt", "vm_admin_csrf"]) {
      expect(response.cookies.get(name)).toMatchObject({ value: "", maxAge: 0 })
    }
  })
})
