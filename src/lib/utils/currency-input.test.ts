import { describe, expect, it } from "vitest"

import { formatCentsInput, parseCurrencyInput } from "./currency-input"

describe("parseCurrencyInput", () => {
  it.each([
    ["89,90", 8990],
    ["89", 8900],
    ["1.234,56", 123456],
    ["R$ 35,00", 3500],
    ["0,5", 50],
  ])("%s → %i centavos", (input, cents) => {
    expect(parseCurrencyInput(input)).toBe(cents)
  })

  it.each(["", "abc", "12,345", "-10"])("rejeita %s", (input) => {
    expect(parseCurrencyInput(input)).toBeNull()
  })
})

describe("formatCentsInput", () => {
  it("formata centavos para o input", () => {
    expect(formatCentsInput(8990)).toBe("89,90")
    expect(formatCentsInput(123456)).toBe("1234,56")
  })
})
