import { describe, expect, it } from "vitest"

import { distanceFormSchema } from "@/lib/validations/distance.schema"
import { priceTierFormSchema } from "@/lib/validations/price-tier.schema"
import type { Distance } from "@/types/api/distance.interface"
import type { PriceTier } from "@/types/api/price-tier.interface"

import { toDistanceFormValues } from "./distance-form-values"
import { getNextOrder } from "./next-order"
import { toPriceTierFormValues } from "./price-tier-form-values"

describe("valores dos formulários de catálogo", () => {
  it("distância: ida e volta pelo schema", () => {
    const distance: Distance = {
      id: 3,
      eventoId: 1,
      nome: "10 km",
      descricao: null,
      distanciaMetros: 10000,
      capacidadeTotal: 300,
      horarioLargada: "05:30",
      percursoUrl: null,
      ordem: 2,
      ativo: true,
    }
    const { id, eventoId, ...input } = distance
    expect({ id, eventoId }).toEqual({ id: 3, eventoId: 1 })
    expect(distanceFormSchema.parse(toDistanceFormValues(distance))).toEqual(input)
  })

  it("lote: centavos e período em Fortaleza", () => {
    const tier: PriceTier = {
      id: 9,
      distanciaId: 3,
      nome: "1º lote",
      precoCentavos: 8990,
      inicioEm: "2026-11-01T03:00:00Z",
      fimEm: "2026-11-30T23:59:00-03:00",
      quantidadeTotal: null,
      ordem: 1,
      ativo: true,
    }
    const values = toPriceTierFormValues(tier)
    expect(values).toMatchObject({ precoCentavos: "89,90", inicioEm: "2026-11-01T00:00", fimEm: "2026-11-30T23:59" })
    expect(priceTierFormSchema.parse(values)).toMatchObject({ precoCentavos: 8990, inicioEm: "2026-11-01T00:00:00-03:00" })
  })

  it("próxima ordem", () => {
    expect(getNextOrder([])).toBe(1)
    expect(getNextOrder([{ ordem: 2 }, { ordem: 5 }])).toBe(6)
  })
})
