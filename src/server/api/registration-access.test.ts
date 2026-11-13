import { beforeEach, describe, expect, it, vi } from "vitest"

const jar = new Map<string, { value: string; options?: Record<string, unknown> }>()
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => {
      const entry = jar.get(name)
      return entry ? { name, value: entry.value } : undefined
    },
    set: (name: string, value: string, options?: Record<string, unknown>) => jar.set(name, { value, options }),
  }),
}))

import { getRegistrationAccessToken, registrationCookieName, saveRegistrationAccess } from "./registration-access"

describe("registration-access", () => {
  beforeEach(() => jar.clear())

  it("guarda o token por código, HttpOnly, e lê de volta", async () => {
    await saveRegistrationAccess("VX-2026-00000042", "tok")
    const stored = jar.get(registrationCookieName("VX-2026-00000042"))
    expect(stored?.value).toBe("tok")
    expect(stored?.options).toMatchObject({ httpOnly: true, sameSite: "lax", path: "/" })
    expect(await getRegistrationAccessToken("VX-2026-00000042")).toBe("tok")
  })

  it("sem cookie devolve null", async () => {
    expect(await getRegistrationAccessToken("VX-2026-00000001")).toBeNull()
  })
})
