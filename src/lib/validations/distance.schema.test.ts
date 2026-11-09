import { describe, expect, it } from "vitest"

import { distanceFormSchema, type DistanceFormInput } from "./distance.schema"

const valid: DistanceFormInput = {
  nome: "5 km",
  descricao: "",
  distanciaMetros: "5000",
  capacidadeTotal: "400",
  horarioLargada: "",
  percursoUrl: "",
  ordem: "1",
  ativo: true,
}

const errorPaths = (input: DistanceFormInput) => {
  const result = distanceFormSchema.safeParse(input)
  return result.success ? [] : [...new Set(result.error.issues.map((issue) => issue.path.join(".")))]
}

describe("distanceFormSchema", () => {
  it("converte para o formato da API", () => {
    expect(distanceFormSchema.parse({ ...valid, horarioLargada: "05:30" })).toEqual({
      nome: "5 km",
      descricao: null,
      distanciaMetros: 5000,
      capacidadeTotal: 400,
      horarioLargada: "05:30",
      percursoUrl: null,
      ordem: 1,
      ativo: true,
    })
  })

  it("números inteiros e positivos", () => {
    expect(errorPaths({ ...valid, distanciaMetros: "5,5" })).toEqual(["distanciaMetros"])
    expect(errorPaths({ ...valid, distanciaMetros: "0" })).toEqual(["distanciaMetros"])
    expect(errorPaths({ ...valid, capacidadeTotal: "" })).toEqual(["capacidadeTotal"])
    expect(errorPaths({ ...valid, ordem: "-1" })).toEqual(["ordem"])
  })

  it("horário e URL opcionais validados", () => {
    expect(errorPaths({ ...valid, horarioLargada: "25:00" })).toEqual(["horarioLargada"])
    expect(errorPaths({ ...valid, percursoUrl: "percurso" })).toEqual(["percursoUrl"])
  })
})
