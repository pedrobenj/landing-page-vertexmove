import { describe, expect, it } from "vitest"

import type { PublicEventDetail } from "@/types/api/public-event-detail.interface"

import { buildEventJsonLd } from "./build-event-json-ld"

function event(overrides: Partial<PublicEventDetail> = {}): PublicEventDetail {
  return {
    slug: "corrida",
    nome: "Corrida",
    descricao: "Descrição",
    dataEvento: "2026-12-06",
    horarioLargada: "05:30",
    localizacao: { localNome: "Beira-Mar", cidade: "Fortaleza", uf: "CE" },
    imagemCapaUrl: null,
    ...overrides,
  }
}

const options = { siteUrl: "https://vertex.test", lowestPrice: null }

describe("buildEventJsonLd", () => {
  it("monta o startDate com horário e fuso de Fortaleza", () => {
    expect(buildEventJsonLd(event(), options).startDate).toBe("2026-12-06T05:30:00-03:00")
  })

  it("ignora segundos quando a API manda HH:mm:ss", () => {
    expect(buildEventJsonLd(event({ horarioLargada: "05:30:00" }), options).startDate).toBe("2026-12-06T05:30:00-03:00")
  })

  it("usa só a data quando o horário é inválido", () => {
    expect(buildEventJsonLd(event({ horarioLargada: "5h30" }), options).startDate).toBe("2026-12-06")
  })

  it("inclui a oferta só quando há preço", () => {
    expect(buildEventJsonLd(event(), options).offers).toBeUndefined()
    expect(buildEventJsonLd(event(), { ...options, lowestPrice: 6990 }).offers).toMatchObject({ price: "69.90" })
  })
})
