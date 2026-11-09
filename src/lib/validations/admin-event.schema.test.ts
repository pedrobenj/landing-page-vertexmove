import { describe, expect, it } from "vitest"

import { adminEventFormSchema, type AdminEventFormInput } from "./admin-event.schema"

const valid: AdminEventFormInput = {
  slug: "corrida-do-sol-2026",
  nome: "Corrida do Sol 2026",
  descricao: "Corrida ao nascer do sol na Beira-Mar.",
  dataEvento: "2026-12-06",
  horarioLargada: "05:30",
  localNome: "Aterrinho da Praia de Iracema",
  endereco: "",
  complemento: "",
  bairro: "",
  cidade: "Fortaleza",
  uf: "ce",
  cep: "60.165-121",
  latitude: "-3,7253",
  longitude: "-38.4970",
  imagemCapaUrl: "",
  galeriaUrl: "https://fotos.example.com/sol",
}

const errorPaths = (input: AdminEventFormInput) => {
  const result = adminEventFormSchema.safeParse(input)
  return result.success ? [] : [...new Set(result.error.issues.map((issue) => issue.path.join(".")))]
}

describe("adminEventFormSchema", () => {
  it("converte para o formato da API", () => {
    expect(adminEventFormSchema.parse(valid)).toEqual({
      slug: "corrida-do-sol-2026",
      nome: "Corrida do Sol 2026",
      descricao: "Corrida ao nascer do sol na Beira-Mar.",
      dataEvento: "2026-12-06",
      horarioLargada: "05:30",
      localNome: "Aterrinho da Praia de Iracema",
      endereco: null,
      complemento: null,
      bairro: null,
      cidade: "Fortaleza",
      uf: "CE",
      cep: "60165121",
      latitude: -3.7253,
      longitude: -38.497,
      imagemCapaUrl: null,
      galeriaUrl: "https://fotos.example.com/sol",
    })
  })

  it("slug em kebab-case", () => {
    expect(errorPaths({ ...valid, slug: "Corrida do Sol" })).toEqual(["slug"])
    expect(errorPaths({ ...valid, slug: "corrida--sol" })).toEqual(["slug"])
    expect(errorPaths({ ...valid, slug: "-corrida" })).toEqual(["slug"])
    expect(errorPaths({ ...valid, slug: "" })).toEqual(["slug"])
  })

  it("data YYYY-MM-DD existente e horário HH:mm", () => {
    expect(errorPaths({ ...valid, dataEvento: "06/12/2026" })).toEqual(["dataEvento"])
    expect(errorPaths({ ...valid, dataEvento: "2026-02-30" })).toEqual(["dataEvento"])
    expect(errorPaths({ ...valid, horarioLargada: "5:30" })).toEqual(["horarioLargada"])
    expect(errorPaths({ ...valid, horarioLargada: "24:00" })).toEqual(["horarioLargada"])
  })

  it("UF com 2 letras", () => {
    expect(errorPaths({ ...valid, uf: "Ceará" })).toEqual(["uf"])
    expect(errorPaths({ ...valid, uf: "C1" })).toEqual(["uf"])
  })

  it("CEP com 8 dígitos ou vazio", () => {
    expect(errorPaths({ ...valid, cep: "6016512" })).toEqual(["cep"])
    expect(adminEventFormSchema.parse({ ...valid, cep: "" }).cep).toBeNull()
  })

  it("coordenadas opcionais dentro do intervalo", () => {
    expect(errorPaths({ ...valid, latitude: "91" })).toEqual(["latitude"])
    expect(errorPaths({ ...valid, longitude: "abc" })).toEqual(["longitude"])
    const parsed = adminEventFormSchema.parse({ ...valid, latitude: "", longitude: " " })
    expect(parsed.latitude).toBeNull()
    expect(parsed.longitude).toBeNull()
  })

  it("URLs opcionais, só http(s)", () => {
    expect(errorPaths({ ...valid, imagemCapaUrl: "capa.jpg" })).toEqual(["imagemCapaUrl"])
    expect(errorPaths({ ...valid, galeriaUrl: "javascript:alert(1)" })).toEqual(["galeriaUrl"])
  })

  it("campos obrigatórios", () => {
    expect(errorPaths({ ...valid, nome: "", descricao: " ", localNome: "", cidade: "" })).toEqual([
      "nome",
      "descricao",
      "localNome",
      "cidade",
    ])
  })
})
