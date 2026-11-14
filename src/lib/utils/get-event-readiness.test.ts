import { describe, expect, it } from "vitest"

import { DOCUMENT_TYPE } from "@/enums/document-type.enum"
import type { EventDocument } from "@/types/api/document.interface"
import type { PriceTier } from "@/types/api/price-tier.interface"

import { getEventReadiness, type ReadinessDistance } from "./get-event-readiness"

const NOW = new Date("2026-11-14T12:00:00-03:00")

const tier = (overrides: Partial<PriceTier> = {}) =>
  ({ inicioEm: "2026-11-01T00:00:00-03:00", fimEm: "2026-12-01T00:00:00-03:00", ativo: true, ...overrides }) as PriceTier
const doc = (tipo: DOCUMENT_TYPE, vigenteEm = "2026-11-01T00:00:00-03:00") => ({ tipo, vigenteEm }) as EventDocument
const DOCS = [doc(DOCUMENT_TYPE.REGULATION), doc(DOCUMENT_TYPE.LIABILITY_TERM)]
const distance = (overrides: Partial<ReadinessDistance> = {}): ReadinessDistance => ({ ativo: true, lotes: [tier()], ...overrides })

describe("getEventReadiness", () => {
  it("pronta com distância ativa com lote vigente, regulamento e termo vigentes", () => {
    expect(getEventReadiness({ distances: [distance()], documents: DOCS }, NOW)).toEqual({ ready: true, missing: [] })
  })

  it("sem distâncias, sem lote ou com lote fora da janela falta o lote", () => {
    expect(getEventReadiness({ distances: [], documents: DOCS }, NOW).missing).toEqual(["lote"])
    expect(getEventReadiness({ distances: [distance({ lotes: [] })], documents: DOCS }, NOW).missing).toEqual(["lote"])
    const future = distance({ lotes: [tier({ inicioEm: "2026-11-20T00:00:00-03:00" })] })
    expect(getEventReadiness({ distances: [future], documents: DOCS }, NOW).missing).toEqual(["lote"])
  })

  it("lote vigente em distância inativa não conta", () => {
    expect(getEventReadiness({ distances: [distance({ ativo: false })], documents: DOCS }, NOW).missing).toEqual(["lote"])
  })

  it("documento ausente ou ainda não vigente falta", () => {
    expect(getEventReadiness({ distances: [distance()], documents: [doc(DOCUMENT_TYPE.REGULATION)] }, NOW)).toEqual({
      ready: false,
      missing: ["termo"],
    })
    const futureTerm = [doc(DOCUMENT_TYPE.REGULATION), doc(DOCUMENT_TYPE.LIABILITY_TERM, "2026-12-01T00:00:00-03:00")]
    expect(getEventReadiness({ distances: [distance()], documents: futureTerm }, NOW).missing).toEqual(["termo"])
  })

  it("lista tudo o que falta, nesta ordem", () => {
    expect(getEventReadiness({ distances: [], documents: [] }, NOW).missing).toEqual(["lote", "regulamento", "termo"])
  })
})
