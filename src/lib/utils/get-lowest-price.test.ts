import { describe, expect, it } from "vitest"

import type { PublicDistance } from "@/types/api/public-event-detail.interface"

import { getLowestPrice } from "./get-lowest-price"

function distance(overrides: Partial<PublicDistance>): PublicDistance {
  return {
    id: 1,
    nome: "5 km",
    distanciaMetros: 5000,
    loteVigente: { nome: "1º lote", precoCentavos: 8990 },
    esgotado: false,
    ...overrides,
  }
}

describe("getLowestPrice", () => {
  it("retorna o menor preço entre as distâncias disponíveis", () => {
    const distances = [
      distance({ id: 1, loteVigente: { nome: "1º lote", precoCentavos: 9990 } }),
      distance({ id: 2, loteVigente: { nome: "1º lote", precoCentavos: 6990 } }),
      distance({ id: 3, loteVigente: { nome: "2º lote", precoCentavos: 8990 } }),
    ]
    expect(getLowestPrice(distances)).toBe(6990)
  })

  it("ignora distâncias esgotadas", () => {
    const distances = [
      distance({ id: 1, esgotado: true, loteVigente: { nome: "1º lote", precoCentavos: 5000 } }),
      distance({ id: 2, loteVigente: { nome: "1º lote", precoCentavos: 8990 } }),
    ]
    expect(getLowestPrice(distances)).toBe(8990)
  })

  it("ignora distâncias sem lote vigente", () => {
    const distances = [distance({ id: 1, loteVigente: null }), distance({ id: 2 })]
    expect(getLowestPrice(distances)).toBe(8990)
  })

  it("retorna null sem distâncias disponíveis", () => {
    expect(getLowestPrice(undefined)).toBeNull()
    expect(getLowestPrice([])).toBeNull()
    expect(getLowestPrice([distance({ esgotado: true }), distance({ id: 2, loteVigente: null })])).toBeNull()
  })
})
