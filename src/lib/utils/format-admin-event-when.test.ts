import { describe, expect, it } from "vitest"

import { formatAdminEventWhen } from "./format-admin-event-when"

describe("formatAdminEventWhen", () => {
  it("data e largada quando a API manda o horário", () => {
    expect(formatAdminEventWhen({ dataEvento: "2026-12-12", horarioLargada: "07:00" })).toBe("12/12/2026 · 07:00")
  })

  it("só a data quando a listagem do backend não traz o horário", () => {
    expect(formatAdminEventWhen({ dataEvento: "2026-12-12" })).toBe("12/12/2026")
  })
})
