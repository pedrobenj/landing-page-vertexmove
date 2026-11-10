import { describe, expect, it } from "vitest"

import { receiptRequestSchema, receiptVerificationSchema } from "./receipt.schema"

describe("receipt schemas", () => {
  it("aceita a data de nascimento no formato DD/MM/AAAA", () => {
    expect(receiptVerificationSchema.safeParse({ dataNascimento: "10/05/1990" }).success).toBe(true)
  })

  it("recusa data vazia ou inexistente com mensagem em português", () => {
    const empty = receiptVerificationSchema.safeParse({ dataNascimento: "" })
    const invalid = receiptVerificationSchema.safeParse({ dataNascimento: "31/02/1990" })
    expect(empty.error?.issues[0]?.message).toBe("Informe a data de nascimento")
    expect(invalid.error?.issues[0]?.message).toBe("Data inválida")
  })

  it("exige a referência da consulta", () => {
    expect(receiptRequestSchema.safeParse({ referencia: "", dataNascimento: "10/05/1990" }).success).toBe(false)
    expect(receiptRequestSchema.safeParse({ referencia: "abc", dataNascimento: "10/05/1990" }).success).toBe(true)
  })
})
