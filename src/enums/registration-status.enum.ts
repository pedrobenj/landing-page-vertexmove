import { RegistrationStatus } from "@/generated/prisma/enums"

export { RegistrationStatus }

export const REGISTRATION_STATUS_LABEL: Record<RegistrationStatus, string> = {
  PENDING: "Aguardando pagamento",
  PAID: "Confirmada",
  CANCELLED: "Cancelada",
  EXPIRED: "Expirada",
  REFUNDED: "Reembolsada",
}

/** Status que ocupam vaga na modalidade (PENDING só enquanto não expirada). */
export const ACTIVE_REGISTRATION_STATUSES: RegistrationStatus[] = [
  RegistrationStatus.PENDING,
  RegistrationStatus.PAID,
]
