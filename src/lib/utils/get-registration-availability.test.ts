import { describe, expect, it } from "vitest"

import { DOCUMENT_TYPE } from "@/enums/document-type.enum"
import type { PublicDistance, PublicEventDetail } from "@/types/api/public-event-detail.interface"

import { getRegistrationAvailability } from "./get-registration-availability"

const distance: PublicDistance = {
  id: 1,
  nome: "5 km",
  distanciaMetros: 5000,
  loteVigente: { nome: "1º lote", precoCentavos: 8990 },
  esgotado: false,
}
const regulation = { id: 101, tipo: DOCUMENT_TYPE.REGULATION, versao: "1.0", titulo: "Regulamento", url: "https://x/r.pdf" }
const term = { id: 102, tipo: DOCUMENT_TYPE.LIABILITY_TERM, versao: "1.0", titulo: "Termo", url: "https://x/t.pdf" }

function buildEvent(overrides: Partial<PublicEventDetail> = {}): PublicEventDetail {
  return {
    slug: "corrida",
    nome: "Corrida",
    descricao: "",
    dataEvento: "2026-12-06",
    horarioLargada: "05:30",
    localizacao: { localNome: "Aterro", cidade: "Fortaleza", uf: "CE" },
    imagemCapaUrl: null,
    distancias: [distance],
    documentosVigentes: [regulation, term],
    ...overrides,
  }
}

describe("getRegistrationAvailability", () => {
  it("aberta com distâncias e os dois documentos", () => {
    expect(getRegistrationAvailability(buildEvent())).toEqual({ status: "open", regulation, liabilityTerm: term })
  })

  it("em breve sem distâncias, sem documentos ou sem lote vigente", () => {
    expect(getRegistrationAvailability(buildEvent({ distancias: undefined })).status).toBe("soon")
    expect(getRegistrationAvailability(buildEvent({ documentosVigentes: [regulation] })).status).toBe("soon")
    expect(getRegistrationAvailability(buildEvent({ distancias: [{ ...distance, loteVigente: null }] })).status).toBe("soon")
  })

  it("esgotada quando todas as distâncias esgotaram", () => {
    expect(getRegistrationAvailability(buildEvent({ distancias: [{ ...distance, esgotado: true }] })).status).toBe("sold-out")
  })
})
