import { describe, expect, it } from "vitest"

import { ADMIN_ROLE } from "@/enums/admin-role.enum"

import { canManageEvents, canManageStore } from "./admin-permissions"

describe("canManageEvents", () => {
  it("o papel único do backend (admin) gerencia corridas e loja", () => {
    expect(canManageEvents(ADMIN_ROLE.ADMIN)).toBe(true)
    expect(canManageStore(ADMIN_ROLE.ADMIN)).toBe(true)
  })

  it("organização e super admin gerenciam corridas", () => {
    expect(canManageEvents(ADMIN_ROLE.ORGANIZATION)).toBe(true)
    expect(canManageEvents(ADMIN_ROLE.SUPER_ADMIN)).toBe(true)
  })

  it("operador e papéis desconhecidos só leem", () => {
    expect(canManageEvents(ADMIN_ROLE.OPERATOR)).toBe(false)
    expect(canManageEvents("visitante")).toBe(false)
  })
})

describe("canManageStore", () => {
  it("segue a matriz das corridas: operador não altera produtos", () => {
    expect(canManageStore(ADMIN_ROLE.ORGANIZATION)).toBe(true)
    expect(canManageStore(ADMIN_ROLE.OPERATOR)).toBe(false)
  })
})
