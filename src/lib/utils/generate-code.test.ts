import { describe, expect, it } from "vitest"

import { generateOrderCode } from "./generate-code"
import { ORDER_CODE_PATTERN } from "./is-order-code"

describe("generate-code", () => {
  it("gera código de pedido VTX-P-XXXXX-XXXXX com o alfabeto do backend (sem 0/O e 1/I)", () => {
    expect(generateOrderCode()).toMatch(/^VTX-P-[2-9A-HJ-NP-Z]{5}-[2-9A-HJ-NP-Z]{5}$/)
  })

  it("gera códigos distintos e aceitos pelo padrão da página do pedido", () => {
    const codes = new Set(Array.from({ length: 200 }, generateOrderCode))
    expect(codes.size).toBe(200)
    for (const code of codes) expect(code).toMatch(ORDER_CODE_PATTERN)
  })
})
