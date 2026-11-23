import { describe, expect, it } from "vitest"

import { LGPD_REQUEST_TYPE } from "@/enums/lgpd-request-type.enum"

import { lgpdRequestSchema, type LgpdRequestFormInput } from "./lgpd-request.schema"

const valid: LgpdRequestFormInput = {
  tipo: LGPD_REQUEST_TYPE.ACCESS,
  nome: "  Maria   da Silva ",
  cpf: "529.982.247-25",
  email: "maria@example.com",
  whatsapp: "(85) 99999-0000",
  mensagem: "  Quero saber quais dados vocês têm.  ",
  aceite: true,
}

function issues(input: LgpdRequestFormInput): Record<string, string> {
  const result = lgpdRequestSchema.safeParse(input)
  if (result.success) return {}
  return Object.fromEntries(result.error.issues.map((issue) => [issue.path.join("."), issue.message]))
}

describe("lgpdRequestSchema", () => {
  it("normaliza para o corpo da API: nome, CPF só dígitos, WhatsApp E.164 e aceite literal", () => {
    const result = lgpdRequestSchema.parse(valid)
    expect(result).toEqual({
      tipo: "acesso",
      nome: "Maria da Silva",
      cpf: "52998224725",
      email: "maria@example.com",
      whatsapp: "+5585999990000",
      mensagem: "Quero saber quais dados vocês têm.",
      aceite: true,
    })
  })

  it("campos opcionais vazios ficam fora do corpo (o backend recusa null)", () => {
    const onlyEmail = lgpdRequestSchema.parse({ ...valid, whatsapp: "", mensagem: "" })
    expect(onlyEmail).not.toHaveProperty("whatsapp")
    expect(onlyEmail).not.toHaveProperty("mensagem")
    expect(lgpdRequestSchema.parse({ ...valid, email: "" })).not.toHaveProperty("email")
  })

  it("exige tipo, nome completo, CPF válido, um contato e o aceite", () => {
    expect(
      issues({ ...valid, tipo: "" as LGPD_REQUEST_TYPE, nome: "Maria", cpf: "111.111.111-11", email: "", whatsapp: "", aceite: false }),
    ).toEqual({
      tipo: "Escolha o tipo de solicitação",
      nome: "Informe o nome completo",
      cpf: "CPF inválido",
      email: "Informe um e-mail ou um WhatsApp para a resposta",
      aceite: "Confirme que você é o titular dos dados ou o representante legal dele",
    })
  })

  it("nome com até 120 caracteres (limite da tabela solicitacao_titular)", () => {
    expect(issues({ ...valid, nome: `Maria ${"a".repeat(115)}` })).toEqual({ nome: "Nome muito longo" })
  })

  it("valida o formato do e-mail e do WhatsApp e limita a mensagem", () => {
    expect(issues({ ...valid, email: "maria@", whatsapp: "123", mensagem: "a".repeat(2001) })).toEqual({
      email: "E-mail inválido",
      whatsapp: "Informe um WhatsApp válido com DDD",
      mensagem: "No máximo 2000 caracteres",
    })
  })
})
