import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { isMinorOnDate } from "./is-minor-on-date"

describe("isMinorOnDate", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 10, 9, 12))
  })
  afterEach(() => vi.useRealTimers())

  it("usa a idade na data da prova", () => {
    expect(isMinorOnDate("07/12/2008", "2026-12-06")).toBe(true)
    expect(isMinorOnDate("06/12/2008", "2026-12-06")).toBe(false)
  })

  it("ignora datas inválidas ou no futuro", () => {
    expect(isMinorOnDate("31/02/2015", "2026-12-06")).toBe(false)
    expect(isMinorOnDate("10/11/2026", "2026-12-06")).toBe(false)
    expect(isMinorOnDate("", "2026-12-06")).toBe(false)
  })
})
