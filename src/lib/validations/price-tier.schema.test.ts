import { describe, expect, it } from "vitest"

import { priceTierFormSchema, type PriceTierFormInput } from "./price-tier.schema"

const valid: PriceTierFormInput = {
  nome: "1º lote",
  precoCentavos: "89,90",
  inicioEm: "2026-11-01T00:00",
  fimEm: "2026-11-30T23:59",
  quantidadeTotal: "",
  ordem: "1",
  ativo: true,
}

const errorPaths = (input: PriceTierFormInput) => {
  const result = priceTierFormSchema.safeParse(input)
  return result.success ? [] : [...new Set(result.error.issues.map((issue) => issue.path.join(".")))]
}

describe("priceTierFormSchema", () => {
  it("converte preço para centavos e período para ISO -03:00", () => {
    expect(priceTierFormSchema.parse(valid)).toEqual({
      nome: "1º lote",
      precoCentavos: 8990,
      inicioEm: "2026-11-01T00:00:00-03:00",
      fimEm: "2026-11-30T23:59:00-03:00",
      quantidadeTotal: null,
      ordem: 1,
      ativo: true,
    })
  })

  it("aceita preço com ponto decimal e quantidade", () => {
    const parsed = priceTierFormSchema.parse({ ...valid, precoCentavos: "89.90", quantidadeTotal: "150" })
    expect(parsed.precoCentavos).toBe(8990)
    expect(parsed.quantidadeTotal).toBe(150)
  })

  it("preço inválido e quantidade zero", () => {
    expect(errorPaths({ ...valid, precoCentavos: "abc" })).toEqual(["precoCentavos"])
    expect(errorPaths({ ...valid, quantidadeTotal: "0" })).toEqual(["quantidadeTotal"])
  })

  it("quantidade inválida mostra a mensagem em português (não o invalid_union do Zod)", () => {
    for (const quantidadeTotal of ["0", "abc", "1,5"]) {
      const result = priceTierFormSchema.safeParse({ ...valid, quantidadeTotal })
      expect(result.success).toBe(false)
      expect(result.error?.issues.map((issue) => issue.message)).toEqual([
        "Quantidade deve ser um número inteiro maior que zero",
      ])
    }
  })

  it("fim depois do início", () => {
    expect(errorPaths({ ...valid, fimEm: "2026-10-31T23:59" })).toEqual(["fimEm"])
    expect(errorPaths({ ...valid, inicioEm: "" })).toEqual(["inicioEm"])
  })
})
