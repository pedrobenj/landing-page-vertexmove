import { describe, expect, it } from "vitest"

import { createRateLimiter } from "./rate-limit"

describe("createRateLimiter", () => {
  it("bloqueia acima do limite e libera após a janela", () => {
    const isLimited = createRateLimiter()
    expect(isLimited("ip", 2, 1000, 0)).toBe(false)
    expect(isLimited("ip", 2, 1000, 10)).toBe(false)
    expect(isLimited("ip", 2, 1000, 20)).toBe(true)
    expect(isLimited("ip", 2, 1000, 1001)).toBe(false)
  })
})
