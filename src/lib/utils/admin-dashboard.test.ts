import { describe, expect, it } from "vitest"

import { getAdminShortcuts } from "./admin-dashboard"

describe("getAdminShortcuts", () => {
  it("Nova corrida só para quem pode cadastrar", () => {
    expect(getAdminShortcuts(true).map((item) => item.label)).toEqual(["Nova corrida", "Corridas", "Tamanhos de camisa", "Auditoria"])
    expect(getAdminShortcuts(false).map((item) => item.label)).toEqual(["Corridas", "Tamanhos de camisa", "Auditoria"])
  })
})
