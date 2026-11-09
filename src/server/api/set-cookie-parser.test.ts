import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { parseSetCookies } from "./set-cookie-parser"

function headersWith(...cookies: string[]): Headers {
  const headers = new Headers()
  for (const cookie of cookies) headers.append("Set-Cookie", cookie)
  return headers
}

describe("parseSetCookies", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-11-09T12:00:00Z"))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("lê nome, valor e Max-Age de vários Set-Cookie", () => {
    const result = parseSetCookies(
      headersWith(
        "vm_admin_rt=abc.def; Path=/api/v1/admin/auth; HttpOnly; Max-Age=604800; SameSite=Strict",
        "vm_admin_csrf=xyz; Path=/; Max-Age=604800; SameSite=Strict",
      ),
    )

    expect(result).toEqual({
      vm_admin_rt: { value: "abc.def", maxAge: 604_800 },
      vm_admin_csrf: { value: "xyz", maxAge: 604_800 },
    })
  })

  it("converte Expires em maxAge (segundos a partir de agora)", () => {
    const result = parseSetCookies(headersWith("vm_admin_rt=abc; Expires=Mon, 09 Nov 2026 13:00:00 GMT; HttpOnly"))

    expect(result.vm_admin_rt).toEqual({ value: "abc", maxAge: 3600 })
  })

  it("Max-Age tem prioridade sobre Expires", () => {
    const result = parseSetCookies(headersWith("a=1; Expires=Mon, 09 Nov 2026 13:00:00 GMT; Max-Age=10"))

    expect(result.a.maxAge).toBe(10)
  })

  it("Expires no passado vira maxAge 0", () => {
    const result = parseSetCookies(headersWith("a=1; Expires=Thu, 01 Jan 1970 00:00:00 GMT"))

    expect(result.a.maxAge).toBe(0)
  })

  it("sem Max-Age nem Expires deixa maxAge indefinido", () => {
    expect(parseSetCookies(headersWith("a=1; Path=/"))).toEqual({ a: { value: "1" } })
  })

  it("preserva '=' no valor e decodifica percent-encoding", () => {
    const result = parseSetCookies(headersWith("token=YWJj==; Path=/", "nome=Jo%C3%A3o"))

    expect(result.token.value).toBe("YWJj==")
    expect(result.nome.value).toBe("João")
  })

  it("ignora Max-Age inválido e entradas sem nome", () => {
    const result = parseSetCookies(headersWith("a=1; Max-Age=abc", "=semnome", "lixo"))

    expect(result).toEqual({ a: { value: "1" } })
  })

  it("devolve objeto vazio sem Set-Cookie", () => {
    expect(parseSetCookies(new Headers())).toEqual({})
  })
})
