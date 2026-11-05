import type { RegistrationStatus } from "@/generated/prisma/enums"

/** Dados mínimos exibidos na consulta pública (sem login). Nada de CPF/telefone abertos. */
export interface RegistrationLookupItem {
  code: string
  eventName: string
  eventDate: string
  modalityName: string
  status: RegistrationStatus
}
