import { describe, expect, it } from "vitest"

import { ADMIN_ROLE } from "@/enums/admin-role.enum"

import { canManageEvents } from "./admin-permissions"

describe("canManageEvents", () => {
  it("organização e super admin gerenciam corridas", () => {
    expect(canManageEvents(ADMIN_ROLE.ORGANIZATION)).toBe(true)
    expect(canManageEvents(ADMIN_ROLE.SUPER_ADMIN)).toBe(true)
  })

  it("operador e papéis desconhecidos só leem", () => {
    expect(canManageEvents(ADMIN_ROLE.OPERATOR)).toBe(false)
    expect(canManageEvents("visitante")).toBe(false)
  })
})
