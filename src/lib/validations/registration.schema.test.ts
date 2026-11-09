import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  athleteStepSchema,
  createDistanceStepSchema,
  createRegistrationInputSchema,
  termsStepSchema,
} from "./registration.schema"

const SIZES = [{ id: 3, codigo: "M", descricao: "Médio", ordem: 3, ativo: true }]

function messagesOf(result: { success: boolean; error?: { issues: Array<{ message: string; path: PropertyKey[] }> } }) {
  return result.error?.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`) ?? []
}

describe("createDistanceStepSchema", () => {
  it("exige a distância", () => {
    const result = createDistanceStepSchema({ tamanhosCamisa: SIZES }).safeParse({
      distanciaId: null,
      kitId: null,
      tamanhoCamisaId: null,
    })
    expect(messagesOf(result)).toContain("distanciaId: Escolha a distância")
  })

  it("exige o tamanho da camisa quando há kit e o evento tem tamanhos", () => {
    const result = createDistanceStepSchema({ tamanhosCamisa: SIZES }).safeParse({
      distanciaId: 1,
      kitId: 2,
      tamanhoCamisaId: null,
    })
    expect(messagesOf(result)).toEqual(["tamanhoCamisaId: Escolha o tamanho da camisa"])
  })

  it("não exige tamanho quando o evento não tem tamanhos", () => {
    const result = createDistanceStepSchema({ tamanhosCamisa: [] }).safeParse({ distanciaId: 1, kitId: 2, tamanhoCamisaId: null })
    expect(result.success).toBe(true)
  })

  it("sem kit descarta o tamanho escolhido", () => {
    expect(
      createDistanceStepSchema({ tamanhosCamisa: SIZES }).parse({ distanciaId: 1, kitId: null, tamanhoCamisaId: 3 }),
    ).toEqual({ distanciaId: 1, kitId: null, tamanhoCamisaId: null })
  })
})

describe("athleteStepSchema", () => {
  const valid = {
    nomeCompleto: "Maria da Silva",
    dataNascimento: "06/12/1990",
    cpf: "529.982.247-25",
    whatsapp: "(85) 99999-0000",
    email: "Maria@Example.com",
  }

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 10, 9, 12))
  })
  afterEach(() => vi.useRealTimers())

  it("aceita dados válidos e normaliza o e-mail", () => {
    expect(athleteStepSchema.parse(valid)).toEqual({ ...valid, email: "maria@example.com" })
  })

  it("CPF, WhatsApp e e-mail são opcionais individualmente", () => {
    expect(athleteStepSchema.safeParse({ ...valid, cpf: "", email: "" }).success).toBe(true)
    expect(athleteStepSchema.safeParse({ ...valid, whatsapp: "" }).success).toBe(true)
  })

  it("exige pelo menos um entre CPF e WhatsApp", () => {
    const result = athleteStepSchema.safeParse({ ...valid, cpf: "", whatsapp: "" })
    expect(messagesOf(result)).toEqual(["cpf: Informe o CPF ou o WhatsApp"])
  })

  it("mostra o erro de CPF/WhatsApp junto com os erros dos outros campos", () => {
    const result = athleteStepSchema.safeParse({ ...valid, nomeCompleto: "Maria", cpf: "", whatsapp: "" })
    expect(messagesOf(result)).toEqual(["nomeCompleto: Informe nome e sobrenome", "cpf: Informe o CPF ou o WhatsApp"])
  })

  it("valida CPF, WhatsApp e e-mail quando preenchidos", () => {
    const result = athleteStepSchema.safeParse({ ...valid, cpf: "111.111.111-11", whatsapp: "(85) 8999-000", email: "x@" })
    expect(messagesOf(result)).toEqual([
      "cpf: CPF inválido",
      "whatsapp: Informe um WhatsApp válido com DDD",
      "email: E-mail inválido",
    ])
  })

  it("valida a data de nascimento", () => {
    expect(messagesOf(athleteStepSchema.safeParse({ ...valid, dataNascimento: "31/02/1990" }))).toEqual([
      "dataNascimento: Data inválida",
    ])
    expect(messagesOf(athleteStepSchema.safeParse({ ...valid, dataNascimento: "10/11/2026" }))).toEqual([
      "dataNascimento: A data de nascimento precisa estar no passado",
    ])
    expect(messagesOf(athleteStepSchema.safeParse({ ...valid, dataNascimento: "01/01/1900" }))).toEqual([
      "dataNascimento: Confira o ano de nascimento",
    ])
  })
})

describe("termsStepSchema", () => {
  it("exige os três aceites com mensagens em português", () => {
    const result = termsStepSchema.safeParse({ aceitaRegulamento: false, aceitaTermo: false, aceitaPrivacidade: false })
    expect(messagesOf(result)).toEqual([
      "aceitaRegulamento: Aceite o regulamento para continuar",
      "aceitaTermo: Aceite o termo de responsabilidade para continuar",
      "aceitaPrivacidade: Aceite a política de privacidade para continuar",
    ])
    expect(termsStepSchema.safeParse({ aceitaRegulamento: true, aceitaTermo: true, aceitaPrivacidade: true }).success).toBe(true)
  })
})

describe("createRegistrationInputSchema", () => {
  const input = {
    eventoSlug: "corrida",
    distanciaId: 1,
    nomeCompleto: "Maria da Silva",
    dataNascimento: "1990-12-06",
    whatsapp: "+5585999990000",
    documentosAceitos: [101, 102],
  }

  it("aceita o corpo do contrato", () => {
    expect(createRegistrationInputSchema.safeParse(input).success).toBe(true)
  })

  it("recusa sem CPF e sem WhatsApp, CPF mascarado e telefone fora do E.164", () => {
    expect(createRegistrationInputSchema.safeParse({ ...input, whatsapp: undefined }).success).toBe(false)
    expect(createRegistrationInputSchema.safeParse({ ...input, cpf: "529.982.247-25" }).success).toBe(false)
    expect(createRegistrationInputSchema.safeParse({ ...input, whatsapp: "85999990000" }).success).toBe(false)
  })
})
