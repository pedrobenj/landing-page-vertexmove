import { describe, expect, it } from "vitest"

import { formatDateTimeSafe } from "./format-date"

describe("formatDateTimeSafe", () => {
  it("formata em Fortaleza", () => {
    expect(formatDateTimeSafe("2026-11-01T03:00:00Z")).toBe("01/11/2026 às 00:00")
  })

  it("instante inválido vira o fallback", () => {
    expect(formatDateTimeSafe("xyz")).toBe("data inválida")
    expect(formatDateTimeSafe("", "—")).toBe("—")
  })
})
