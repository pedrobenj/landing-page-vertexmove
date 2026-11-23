import { describe, expect, it } from "vitest"

import { LGPD_REQUEST_TYPE } from "@/enums/lgpd-request-type.enum"

import { lgpdRequestSchema, type LgpdRequestFormInput } from "./lgpd-request.schema"

const valid: LgpdRequestFormInput = {
  tipo: LGPD_REQUEST_TYPE.ACCESS,
  nomeCompleto: "  Maria   da Silva ",
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
  it("normaliza para o corpo da API: CPF só dígitos, WhatsApp E.164, vazios como null, sem o aceite", () => {
    const result = lgpdRequestSchema.parse(valid)
    expect(result).toEqual({
      tipo: "acesso",
      nomeCompleto: "Maria da Silva",
      cpf: "52998224725",
      email: "maria@example.com",
      whatsapp: "+5585999990000",
      mensagem: "Quero saber quais dados vocês têm.",
    })
  })

  it("aceita só e-mail ou só WhatsApp; mensagem vazia vira null", () => {
    expect(lgpdRequestSchema.parse({ ...valid, whatsapp: "", mensagem: "" })).toMatchObject({ whatsapp: null, mensagem: null })
    expect(lgpdRequestSchema.parse({ ...valid, email: "" })).toMatchObject({ email: null })
  })

  it("exige tipo, nome completo, CPF válido, um contato e o aceite", () => {
    expect(
      issues({ ...valid, tipo: "" as LGPD_REQUEST_TYPE, nomeCompleto: "Maria", cpf: "111.111.111-11", email: "", whatsapp: "", aceite: false }),
    ).toEqual({
      tipo: "Escolha o tipo de solicitação",
      nomeCompleto: "Informe o nome completo",
      cpf: "CPF inválido",
      email: "Informe um e-mail ou um WhatsApp para a resposta",
      aceite: "Confirme que você é o titular dos dados ou o representante legal dele",
    })
  })

  it("nome com até 120 caracteres (limite da tabela solicitacao_titular)", () => {
    expect(issues({ ...valid, nomeCompleto: `Maria ${"a".repeat(115)}` })).toEqual({ nomeCompleto: "Nome muito longo" })
  })

  it("valida o formato do e-mail e do WhatsApp e limita a mensagem", () => {
    expect(issues({ ...valid, email: "maria@", whatsapp: "123", mensagem: "a".repeat(2001) })).toEqual({
      email: "E-mail inválido",
      whatsapp: "Informe um WhatsApp válido com DDD",
      mensagem: "No máximo 2000 caracteres",
    })
  })
})
