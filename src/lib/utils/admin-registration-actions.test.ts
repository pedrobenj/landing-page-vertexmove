import { describe, expect, it } from "vitest"

import { REGISTRATION_STATUS } from "@/enums/registration-status.enum"

import { canCancelRegistration, getKitPickupAction } from "./admin-registration-actions"

describe("ações da inscrição no admin", () => {
  it("retirada: marcar só confirmada sem retirada; desfazer quando já retirou", () => {
    expect(getKitPickupAction({ status: REGISTRATION_STATUS.CONFIRMED, kitRetiradoEm: null })).toBe("marcar")
    expect(getKitPickupAction({ status: REGISTRATION_STATUS.CONFIRMED, kitRetiradoEm: "2026-11-20T10:00:00-03:00" })).toBe("desfazer")
    expect(getKitPickupAction({ status: REGISTRATION_STATUS.PENDING, kitRetiradoEm: null })).toBeNull()
    // Cancelada depois de retirar: ainda dá para desfazer o registro.
    expect(getKitPickupAction({ status: REGISTRATION_STATUS.CANCELLED, kitRetiradoEm: "2026-11-20T10:00:00-03:00" })).toBe("desfazer")
  })

  it("cancelar só pendente ou confirmada", () => {
    expect(canCancelRegistration(REGISTRATION_STATUS.PENDING)).toBe(true)
    expect(canCancelRegistration(REGISTRATION_STATUS.CONFIRMED)).toBe(true)
    expect(canCancelRegistration(REGISTRATION_STATUS.CANCELLED)).toBe(false)
    expect(canCancelRegistration(REGISTRATION_STATUS.EXPIRED)).toBe(false)
    expect(canCancelRegistration(REGISTRATION_STATUS.REFUNDED)).toBe(false)
  })
})
