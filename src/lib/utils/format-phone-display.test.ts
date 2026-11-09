import { describe, expect, it } from "vitest"

import { formatPhoneDisplay } from "./format-phone-display"

describe("formatPhoneDisplay", () => {
  it("remove o código do país e formata celular", () => {
    expect(formatPhoneDisplay("5585999999999")).toBe("(85) 99999-9999")
    expect(formatPhoneDisplay("+55 85 99999-9999")).toBe("(85) 99999-9999")
  })

  it("formata fixo com ou sem código do país", () => {
    expect(formatPhoneDisplay("558532221111")).toBe("(85) 3222-1111")
    expect(formatPhoneDisplay("8532221111")).toBe("(85) 3222-1111")
  })

  it("formata número nacional já com 11 dígitos", () => {
    expect(formatPhoneDisplay("85999999999")).toBe("(85) 99999-9999")
  })

  it("devolve vazio para entrada vazia", () => {
    expect(formatPhoneDisplay("")).toBe("")
  })
})
