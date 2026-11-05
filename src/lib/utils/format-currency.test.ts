import { describe, expect, it } from "vitest"

import { formatCurrency } from "./format-currency"

describe("formatCurrency", () => {
  it("formata centavos em reais", () => {
    expect(formatCurrency(8990)).toBe("R$\u00a089,90")
  })
})
