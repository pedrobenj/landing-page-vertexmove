import { describe, expect, it } from "vitest"

import { lookupSchema } from "./lookup.schema"

describe("lookupSchema", () => {
  it("aceita CPF válido (com ou sem máscara)", () => {
    expect(lookupSchema.safeParse({ tipo: "cpf", valor: "529.982.247-25" }).success).toBe(true)
    expect(lookupSchema.safeParse({ tipo: "cpf", valor: "52998224725" }).success).toBe(true)
  })

  it("aceita WhatsApp válido com DDD", () => {
    expect(lookupSchema.safeParse({ tipo: "whatsapp", valor: "(85) 99999-0000" }).success).toBe(true)
  })

  it("valida o valor conforme o tipo, com mensagem no campo", () => {
    const cpf = lookupSchema.safeParse({ tipo: "cpf", valor: "111.111.111-11" })
    expect(cpf.error?.issues.map((issue) => [issue.path.join("."), issue.message])).toEqual([["valor", "CPF inválido"]])

    const phone = lookupSchema.safeParse({ tipo: "whatsapp", valor: "(85) 8999-00" })
    expect(phone.error?.issues.map((issue) => [issue.path.join("."), issue.message])).toEqual([
      ["valor", "Informe um WhatsApp válido com DDD"],
    ])
  })

  it("recusa tipo desconhecido e valor vazio", () => {
    expect(lookupSchema.safeParse({ tipo: "email", valor: "a@b.com" }).success).toBe(false)
    expect(lookupSchema.safeParse({ tipo: "cpf", valor: "" }).error?.issues[0]?.message).toBe("Informe o CPF")
  })
})
