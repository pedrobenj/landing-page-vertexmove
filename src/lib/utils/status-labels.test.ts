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
      expect(getEventStatusLabel(status)).not.toBe(status)
      expect(getEventStatusBadgeClass(status)).toBeTruthy()
    }
  })

  it("tem badge próprio para os status não neutros", () => {
    const fallback = "bg-muted text-muted-foreground"
    for (const status of [EVENT_STATUS.PUBLISHED, EVENT_STATUS.CLOSED, EVENT_STATUS.CANCELLED, EVENT_STATUS.ARCHIVED]) {
      expect(getEventStatusBadgeClass(status)).not.toBe(fallback)
    }
    for (const status of [REGISTRATION_STATUS.PENDING, REGISTRATION_STATUS.CONFIRMED, REGISTRATION_STATUS.CANCELLED]) {
      expect(getRegistrationStatusBadgeClass(status)).not.toBe(fallback)
    }
  })

  it("destaca evento publicado com a cor de CTA", () => {
    expect(getEventStatusBadgeClass(EVENT_STATUS.PUBLISHED)).toContain("bg-cta")
  })

  it("rotula todos os status de inscrição", () => {
    expect(getRegistrationStatusLabel(REGISTRATION_STATUS.PENDING)).toBe("Pendente")
    expect(getRegistrationStatusLabel(REGISTRATION_STATUS.CONFIRMED)).toBe("Confirmada")
    for (const status of Object.values(REGISTRATION_STATUS)) {
      expect(getRegistrationStatusLabel(status)).not.toBe(status)
      expect(getRegistrationStatusBadgeClass(status)).toBeTruthy()
    }
  })

  it("devolve o próprio valor para status desconhecido", () => {
    expect(getEventStatusLabel("novo_status")).toBe("novo_status")
    expect(getRegistrationStatusLabel("novo_status")).toBe("novo_status")
    expect(getRegistrationStatusBadgeClass("novo_status")).toBe("bg-muted text-muted-foreground")
    expect(getEventStatusBadgeClass("novo_status")).toBe("bg-muted text-muted-foreground")
  })
})
