import { describe, expect, it } from "vitest"

import { checkoutSchema } from "./checkout.schema"

const valid = {
  name: "Maria da Silva",
  cpf: "529.982.247-25",
  whatsapp: "(85) 98888-7777",
  email: "maria@exemplo.com",
  acceptPrivacy: true,
  items: [{ variantId: "a", quantity: 1 }],
}

describe("checkoutSchema", () => {
  it("normaliza CPF e WhatsApp para dígitos", () => {
    const result = checkoutSchema.parse(valid)
    expect(result.cpf).toBe("52998224725")
    expect(result.whatsapp).toBe("85988887777")
  })

  it("exige aceite da política de privacidade", () => {
    const result = checkoutSchema.safeParse({ ...valid, acceptPrivacy: false })
    expect(result.success).toBe(false)
  })

  it("rejeita CPF inválido com mensagem em português", () => {
    const result = checkoutSchema.safeParse({ ...valid, cpf: "111.111.111-11" })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe("CPF inválido")
  })

  it("remove espaços e guarda o e-mail em minúsculas", () => {
    const result = checkoutSchema.parse({ ...valid, email: "  Maria@Exemplo.COM " })
    expect(result.email).toBe("maria@exemplo.com")
  })

  it("rejeita e-mail inválido", () => {
    const result = checkoutSchema.safeParse({ ...valid, email: "maria@" })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe("E-mail inválido")
  })

  it("rejeita WhatsApp sem DDD", () => {
    const result = checkoutSchema.safeParse({ ...valid, whatsapp: "98888-7777" })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe("Informe um telefone com DDD")
  })
})
