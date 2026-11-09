import { describe, expect, it } from "vitest"

import { kitFormSchema } from "@/lib/validations/kit.schema"

import { toKitFormValues } from "./kit-form-values"

describe("toKitFormValues", () => {
  it("ordena as fotos pela ordem da API e a ida e volta renumera a partir de 1", () => {
    const values = toKitFormValues({
      id: 1,
      eventoId: 4,
      nome: "Kit",
      descricao: null,
      ativo: false,
      fotos: [
        { url: "https://a.example/2.jpg", alt: "B", ordem: 20 },
        { url: "https://a.example/1.jpg", alt: "A", ordem: 10 },
      ],
    })
    expect(values.descricao).toBe("")
    expect(values.fotos).toEqual([
      { url: "https://a.example/1.jpg", alt: "A" },
      { url: "https://a.example/2.jpg", alt: "B" },
    ])
    expect(kitFormSchema.parse(values).fotos.map((photo) => photo.ordem)).toEqual([1, 2])
  })
})
