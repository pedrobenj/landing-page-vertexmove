import { describe, expect, it } from "vitest"

import { EVENT_STATUS } from "@/enums/event-status.enum"
import { REGISTRATION_STATUS } from "@/enums/registration-status.enum"

import {
  getEventStatusBadgeClass,
  getEventStatusLabel,
  getRegistrationStatusBadgeClass,
  getRegistrationStatusLabel,
} from "./status-labels"

describe("status-labels", () => {
  it("rotula todos os status de evento", () => {
    expect(getEventStatusLabel(EVENT_STATUS.DRAFT)).toBe("Rascunho")
    expect(getEventStatusLabel(EVENT_STATUS.PUBLISHED)).toBe("Publicado")
    for (const status of Object.values(EVENT_STATUS)) {
      expect(getEventStatusLabel(status)).toBeTruthy()
      expect(getEventStatusBadgeClass(status)).toBeTruthy()
    }
  })

  it("destaca evento publicado com a cor de CTA", () => {
    expect(getEventStatusBadgeClass(EVENT_STATUS.PUBLISHED)).toContain("bg-cta")
  })

  it("rotula todos os status de inscrição", () => {
    expect(getRegistrationStatusLabel(REGISTRATION_STATUS.PENDING)).toBe("Pendente")
    expect(getRegistrationStatusLabel(REGISTRATION_STATUS.CONFIRMED)).toBe("Confirmada")
    for (const status of Object.values(REGISTRATION_STATUS)) {
      expect(getRegistrationStatusLabel(status)).toBeTruthy()
      expect(getRegistrationStatusBadgeClass(status)).toBeTruthy()
    }
  })

  it("devolve o próprio valor para status desconhecido", () => {
    expect(getEventStatusLabel("novo_status")).toBe("novo_status")
    expect(getRegistrationStatusLabel("novo_status")).toBe("novo_status")
    expect(getRegistrationStatusBadgeClass("novo_status")).toBe("bg-muted text-muted-foreground")
  })
})
