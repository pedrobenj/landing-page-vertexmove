import { describe, expect, it } from "vitest"

import { getFortalezaToday } from "./get-fortaleza-today"

describe("getFortalezaToday", () => {
  it("data civil em Fortaleza (UTC-3), não em UTC", () => {
    expect(getFortalezaToday(new Date("2026-11-14T02:30:00Z"))).toBe("2026-11-13")
    expect(getFortalezaToday(new Date("2026-11-14T03:00:00Z"))).toBe("2026-11-14")
  })
})
