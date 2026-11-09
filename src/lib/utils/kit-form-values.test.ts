import { describe, expect, it } from "vitest"

import { getEmptyKitPhoto, toKitFormValues } from "./kit-form-values"

describe("kit form values", () => {
  it("ordena as fotos e converte a ordem em texto", () => {
    const values = toKitFormValues({
      id: 1,
      eventoId: 4,
      nome: "Kit",
      descricao: null,
      ativo: false,
      fotos: [
        { url: "https://a.example/2.jpg", alt: "B", ordem: 2 },
        { url: "https://a.example/1.jpg", alt: "A", ordem: 1 },
      ],
    })
    expect(values.descricao).toBe("")
    expect(values.fotos.map((photo) => photo.alt)).toEqual(["A", "B"])
    expect(values.fotos[0].ordem).toBe("1")
  })

  it("foto nova vai depois das existentes", () => {
    expect(getEmptyKitPhoto([]).ordem).toBe("1")
    expect(getEmptyKitPhoto([{ ordem: "3" }, { ordem: "x" }]).ordem).toBe("4")
  })
})
