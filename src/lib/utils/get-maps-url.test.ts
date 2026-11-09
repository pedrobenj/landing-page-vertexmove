import { describe, expect, it } from "vitest"

import type { EventLocation } from "@/types/api/event.interface"

import { formatEventAddress } from "./format-event-address"
import { getMapsUrl } from "./get-maps-url"

const LOCATION: EventLocation = {
  localNome: "Praça Portugal",
  endereco: "Av. Dom Luís, s/n",
  bairro: "Aldeota",
  cidade: "Fortaleza",
  uf: "CE",
  latitude: -3.7357,
  longitude: -38.495,
}

describe("formatEventAddress", () => {
  it("monta o endereço completo", () => {
    expect(formatEventAddress(LOCATION)).toBe("Av. Dom Luís, s/n — Aldeota, Fortaleza/CE")
  })

  it("omite as partes ausentes", () => {
    expect(formatEventAddress({ localNome: "X", cidade: "Fortaleza", uf: "CE" })).toBe("Fortaleza/CE")
  })
})

describe("getMapsUrl", () => {
  it("usa as coordenadas quando existem", () => {
    expect(getMapsUrl(LOCATION)).toBe("https://www.google.com/maps/search/?api=1&query=-3.7357,-38.495")
  })

  it("usa o local e o endereço sem coordenadas", () => {
    const url = getMapsUrl({ ...LOCATION, latitude: null, longitude: null })
    expect(url).toBe(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Praça Portugal, Av. Dom Luís, s/n — Aldeota, Fortaleza/CE")}`,
    )
  })
})
