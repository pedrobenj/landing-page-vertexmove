import { describe, expect, it } from "vitest"

import { generateOrderCode } from "./generate-code"

describe("generate-code", () => {
  it("gera código de pedido VTX-P-XXXX sem caracteres ambíguos", () => {
    expect(generateOrderCode()).toMatch(/^VTX-P-[2-9A-HJKMNP-Z]{4}$/)
  })
})
