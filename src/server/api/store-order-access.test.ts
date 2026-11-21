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

import { getStoreOrderAccessToken, saveStoreOrderAccess, storeOrderCookieName } from "./store-order-access"

const CODE = "VTX-P-7K3PQ-M9X2D"
const NOW = new Date("2026-11-21T12:00:00.000Z")

describe("store-order-access", () => {
  beforeEach(() => jar.clear())

  it("guarda o token por código, HttpOnly, até o fim da reserva + 1 h", async () => {
    await saveStoreOrderAccess(CODE, "tok", "2026-11-21T12:30:00.000Z", NOW)
    const stored = jar.get(storeOrderCookieName(CODE))
    expect(storeOrderCookieName(CODE)).toBe(`vm_pedido_${CODE}`)
    expect(stored?.value).toBe("tok")
    expect(stored?.options).toMatchObject({ httpOnly: true, sameSite: "lax", path: "/", maxAge: 90 * 60 })
    expect(await getStoreOrderAccessToken(CODE)).toBe("tok")
  })

  it("expiraEm inválido ou no passado ainda guarda pela margem", async () => {
    await saveStoreOrderAccess(CODE, "tok", "invalido", NOW)
    expect(jar.get(storeOrderCookieName(CODE))?.options).toMatchObject({ maxAge: 60 * 60 })
  })

  it("sem cookie devolve null", async () => {
    expect(await getStoreOrderAccessToken(CODE)).toBeNull()
  })
})
