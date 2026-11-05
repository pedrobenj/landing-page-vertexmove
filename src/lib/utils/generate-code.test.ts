import { describe, expect, it } from "vitest"

import { generateOrderCode, generateRegistrationCode } from "./generate-code"

describe("generate-code", () => {
  it("gera código de inscrição VTX-XXXX sem caracteres ambíguos", () => {
    expect(generateRegistrationCode()).toMatch(/^VTX-[2-9A-HJKMNP-Z]{4}$/)
  })

  it("gera código de pedido VTX-P-XXXX", () => {
    expect(generateOrderCode()).toMatch(/^VTX-P-[2-9A-HJKMNP-Z]{4}$/)
  })
})
