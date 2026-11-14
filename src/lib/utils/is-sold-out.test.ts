import { describe, expect, it } from "vitest"

import type { PublicDistance } from "@/types/api/public-event-detail.interface"

import { isSoldOut } from "./is-sold-out"

const distance = (overrides: Partial<PublicDistance>) => ({ esgotado: false, loteVigente: null, ...overrides }) as PublicDistance

describe("isSoldOut", () => {
  it("só quando todas as distâncias estão esgotadas", () => {
    expect(isSoldOut([distance({ esgotado: true }), distance({ esgotado: true })])).toBe(true)
    expect(isSoldOut([distance({ esgotado: true }), distance({ esgotado: false })])).toBe(false)
  })

  it("sem lote vigente não é esgotado (inscrições ainda não abriram)", () => {
    expect(isSoldOut([distance({ loteVigente: null })])).toBe(false)
  })

  it("sem distâncias não é esgotado", () => {
    expect(isSoldOut([])).toBe(false)
    expect(isSoldOut(undefined)).toBe(false)
  })
})
