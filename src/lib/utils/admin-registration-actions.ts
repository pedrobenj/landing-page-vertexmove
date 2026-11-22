import { REGISTRATION_STATUS } from "@/enums/registration-status.enum"
import type { ApiAdminRegistration } from "@/types/api/admin-registration.interface"

export type KitPickupAction = "marcar" | "desfazer"

/** Ação de retirada disponível: o backend só aceita marcar em inscrição confirmada (CHECK no banco). */
export function getKitPickupAction(registration: Pick<ApiAdminRegistration, "status" | "kitRetiradoEm">): KitPickupAction | null {
  if (registration.kitRetiradoEm) return "desfazer"
  return registration.status === REGISTRATION_STATUS.CONFIRMED ? "marcar" : null
}

/** Pendente ou confirmada pode ser cancelada pelo admin (D6); a API confere de novo e responde 409. */
export function canCancelRegistration(status: REGISTRATION_STATUS | string): boolean {
  return status === REGISTRATION_STATUS.PENDING || status === REGISTRATION_STATUS.CONFIRMED
}
