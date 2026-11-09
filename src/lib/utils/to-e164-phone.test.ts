import { describe, expect, it } from "vitest"

import { toE164Phone } from "./to-e164-phone"

describe("toE164Phone", () => {
  it("converte celular mascarado", () => {
    expect(toE164Phone("(85) 99999-9999")).toBe("+5585999999999")
  })

  it("converte fixo com 10 dígitos", () => {
    expect(toE164Phone("(85) 3222-1111")).toBe("+558532221111")
  })

  it("aceita entrada que já tem 55 na frente", () => {
    expect(toE164Phone("+55 85 99999-9999")).toBe("+5585999999999")
    expect(toE164Phone("558532221111")).toBe("+558532221111")
  })

  it("lança erro sem 10 ou 11 dígitos nacionais", () => {
    expect(() => toE164Phone("99999-9999")).toThrow(Error)
    expect(() => toE164Phone("")).toThrow(Error)
    expect(() => toE164Phone("123456789012345")).toThrow(Error)
  })

  it("lança erro com DDD inválido ou celular sem o 9", () => {
    expect(() => toE164Phone("(05) 98888-7777")).toThrow(Error)
    expect(() => toE164Phone("(85) 88888-7777")).toThrow(Error)
    expect(() => toE164Phone("+55 10 98888-7777")).toThrow(Error)
  })
})
