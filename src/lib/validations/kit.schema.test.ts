import { describe, expect, it } from "vitest"

import { kitFormSchema, type KitFormInput, MAX_KIT_PHOTOS } from "./kit.schema"

const valid: KitFormInput = {
  nome: "Kit completo",
  descricao: "",
  precoCentavos: "50,00",
  ativo: true,
  fotos: [{ url: "https://cdn.example.com/kit.jpg", alt: "Camisa e medalha" }],
}

const errorPaths = (input: KitFormInput) => {
  const result = kitFormSchema.safeParse(input)
  return result.success ? [] : [...new Set(result.error.issues.map((issue) => issue.path.join(".")))]
}

describe("kitFormSchema", () => {
  it("converte para o formato da API", () => {
    expect(kitFormSchema.parse(valid)).toEqual({
      nome: "Kit completo",
      descricao: null,
      precoCentavos: 5000,
      ativo: true,
      fotos: [{ url: "https://cdn.example.com/kit.jpg", alt: "Camisa e medalha", ordem: 1 }],
    })
  })

  it("exige um preço válido (0 é permitido)", () => {
    expect(errorPaths({ ...valid, precoCentavos: "" })).toEqual(["precoCentavos"])
    expect(errorPaths({ ...valid, precoCentavos: "abc" })).toEqual(["precoCentavos"])
    expect(kitFormSchema.parse({ ...valid, precoCentavos: "0" }).precoCentavos).toBe(0)
  })

  it("a ordem é a posição na lista", () => {
    const parsed = kitFormSchema.parse({
      ...valid,
      fotos: [
        { url: "https://cdn.example.com/b.jpg", alt: "B" },
        { url: "https://cdn.example.com/a.jpg", alt: "A" },
      ],
    })
    expect(parsed.fotos.map((photo) => [photo.alt, photo.ordem])).toEqual([
      ["B", 1],
      ["A", 2],
    ])
  })

  it("aceita kit sem fotos", () => {
    expect(kitFormSchema.parse({ ...valid, fotos: [] }).fotos).toEqual([])
  })

  it("valida cada foto no próprio campo", () => {
    expect(errorPaths({ ...valid, fotos: [{ url: "kit.jpg", alt: "" }] })).toEqual(["fotos.0.url", "fotos.0.alt"])
  })

  it("limita a quantidade de fotos", () => {
    const fotos = Array.from({ length: MAX_KIT_PHOTOS + 1 }, () => ({ ...valid.fotos[0] }))
    expect(errorPaths({ ...valid, fotos })).toEqual(["fotos"])
  })
})
