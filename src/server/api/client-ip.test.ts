import { describe, expect, it, vi } from "vitest"

vi.mock("next/headers", () => ({ headers: async () => new Headers() }))

const { pickForwardHeaders } = await import("./client-ip")

describe("pickForwardHeaders", () => {
  it("prefere o x-real-ip (definido pela Vercel, não forjável pelo cliente)", () => {
    const headers = new Headers({ "x-real-ip": "200.1.1.1", "x-forwarded-for": "6.6.6.6, 200.1.1.1", "user-agent": "UA" })
    expect(pickForwardHeaders(headers)).toEqual({ "X-Forwarded-For": "200.1.1.1", "User-Agent": "UA" })
  })

  it("sem x-real-ip, usa o primeiro IP do x-forwarded-for", () => {
    expect(pickForwardHeaders(new Headers({ "x-forwarded-for": " 10.0.0.1 , 10.0.0.2" }))).toEqual({ "X-Forwarded-For": "10.0.0.1" })
  })

  it("sem nenhum header devolve objeto vazio", () => {
    expect(pickForwardHeaders(new Headers())).toEqual({})
  })
})
