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

  it("descarta entradas vencidas quando o mapa passa de 10.000 chaves", () => {
    const isLimited = createRateLimiter()
    for (let i = 0; i <= 10_000; i++) isLimited(`ip-${i}`, 1, 1000, 0)
    expect(isLimited.size()).toBe(10_001)

    // Janela de todas venceu: a próxima inserção limpa as vencidas.
    expect(isLimited("novo", 1, 1000, 2000)).toBe(false)
    expect(isLimited.size()).toBe(1)
  })

  it("não descarta entradas ainda válidas", () => {
    const isLimited = createRateLimiter()
    for (let i = 0; i <= 10_000; i++) isLimited(`ip-${i}`, 1, 1000, 0)
    expect(isLimited("novo", 1, 1000, 500)).toBe(false)
    expect(isLimited.size()).toBe(10_002)
    expect(isLimited("ip-0", 1, 1000, 500)).toBe(true)
  })
})
