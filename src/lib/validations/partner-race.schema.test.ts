import { describe, expect, it } from "vitest"

import { getEmptyPartnerRaceForm, toPartnerRaceFormValues } from "@/lib/utils/partner-race-form-values"

import { partnerRaceFormSchema, type PartnerRaceFormInput } from "./partner-race.schema"

const valid: PartnerRaceFormInput = {
  nome: " Corrida do Farol ",
  dataEvento: "2027-04-18",
  localNome: "Farol do Mucuripe",
  cidade: "Fortaleza",
  uf: "ce",
  distancias: "5 km, 10 km ,, 21 km",
  cupom: "VERTEX15",
  descontoPercentual: "15",
  realizacao: "",
  urlInscricao: "https://example.com/farol",
  imagemCapaUrl: "",
  ordem: "2",
  ativo: true,
}

function firstError(input: Partial<PartnerRaceFormInput>): string | undefined {
  const result = partnerRaceFormSchema.safeParse({ ...valid, ...input })
  return result.success ? undefined : result.error.issues[0]?.message
}

describe("partnerRaceFormSchema", () => {
  it("converte para o corpo de POST /admin/corridas-parceiras", () => {
    expect(partnerRaceFormSchema.parse(valid)).toEqual({
      nome: "Corrida do Farol",
      dataEvento: "2027-04-18",
      localNome: "Farol do Mucuripe",
      cidade: "Fortaleza",
      uf: "CE",
      distancias: ["5 km", "10 km", "21 km"],
      cupom: "VERTEX15",
      descontoPercentual: 15,
      realizacao: null,
      urlInscricao: "https://example.com/farol",
      imagemCapaUrl: null,
      ordem: 2,
      ativo: true,
    })
  })

  it("exige https nos links (o backend recusa http)", () => {
    expect(firstError({ urlInscricao: "http://example.com" })).toBe("Informe um link https://")
    expect(firstError({ urlInscricao: "" })).toBe("Informe um link https://")
    expect(firstError({ imagemCapaUrl: "http://example.com/a.jpg" })).toBe("Informe um link https://")
  })

  it("valida desconto, UF, data, ordem e distâncias com mensagens em português", () => {
    expect(firstError({ descontoPercentual: "0" })).toBe("Desconto entre 1% e 100%")
    expect(firstError({ descontoPercentual: "101" })).toBe("Desconto entre 1% e 100%")
    expect(firstError({ uf: "C1" })).toBe("UF com 2 letras (ex.: CE)")
    expect(firstError({ dataEvento: "" })).toBe("Informe a data da corrida")
    expect(firstError({ ordem: "40000" })).toBe("Ordem deve ser um número inteiro entre 0 e 32767")
    expect(firstError({ distancias: Array.from({ length: 11 }, (_, index) => `${index + 1} km`).join(",") })).toBe(
      "No máximo 10 distâncias",
    )
    expect(firstError({ distancias: "uma distância com nome comprido demais" })).toBe("Cada distância com até 20 caracteres")
    expect(firstError({ nome: " " })).toBe("Informe o nome da corrida")
    expect(firstError({ cupom: "" })).toBe("Informe o cupom")
  })

  it("form vazio e ida e volta a partir da API", () => {
    expect(getEmptyPartnerRaceForm()).toMatchObject({ uf: "CE", cidade: "Fortaleza", ordem: "0", ativo: true, distancias: "" })
    const values = toPartnerRaceFormValues({
      id: 1,
      nome: "Corrida",
      dataEvento: "2027-01-10",
      localNome: "Praça",
      cidade: "Fortaleza",
      uf: "CE",
      distancias: ["5 km", "10 km"],
      cupom: "VERTEX10",
      descontoPercentual: 10,
      realizacao: null,
      urlInscricao: "https://example.com",
      imagemCapaUrl: null,
      ativo: false,
      ordem: 4,
      criadoEm: "2026-11-22T15:00:00.000Z",
      atualizadoEm: "2026-11-22T15:00:00.000Z",
    })
    expect(values).toMatchObject({ distancias: "5 km, 10 km", descontoPercentual: "10", realizacao: "", imagemCapaUrl: "", ordem: "4", ativo: false })
    expect(partnerRaceFormSchema.parse(values)).toMatchObject({ distancias: ["5 km", "10 km"], ativo: false, ordem: 4 })
  })
})
