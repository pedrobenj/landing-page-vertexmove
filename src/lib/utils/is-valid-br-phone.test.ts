import { describe, expect, it } from "vitest"

import { isValidBrPhone } from "./is-valid-br-phone"

describe("isValidBrPhone", () => {
  it("aceita celular com 9 na frente", () => {
    expect(isValidBrPhone("(85) 98888-7777")).toBe(true)
  })

  it("aceita fixo com 10 dígitos", () => {
    expect(isValidBrPhone("8532221111")).toBe(true)
  })

  it("rejeita 11 dígitos que não começam com 9", () => {
    expect(isValidBrPhone("85888887777")).toBe(false)
  })

  it("rejeita DDD inválido", () => {
    expect(isValidBrPhone("(05) 98888-7777")).toBe(false)
    expect(isValidBrPhone("(10) 98888-7777")).toBe(false)
  })

  it("rejeita quantidade errada de dígitos", () => {
    expect(isValidBrPhone("98888-7777")).toBe(false)
    expect(isValidBrPhone("859888877771")).toBe(false)
  })
})
