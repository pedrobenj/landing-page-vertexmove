import { REGISTRATION_STATUS } from "@/enums/registration-status.enum"

import { getRegistrationStatusLabel } from "./status-labels"

export type AdminRegistrationStatusFilter = REGISTRATION_STATUS | "todos"

/** Opções do filtro de status da lista de inscritos do admin. */
export const REGISTRATION_STATUS_FILTER_OPTIONS: readonly { value: AdminRegistrationStatusFilter; label: string }[] = [
  { value: "todos", label: "Todos" },
  ...Object.values(REGISTRATION_STATUS).map((status) => ({ value: status, label: getRegistrationStatusLabel(status) })),
]

export function isRegistrationStatusFilter(value: string): value is AdminRegistrationStatusFilter {
  return REGISTRATION_STATUS_FILTER_OPTIONS.some((option) => option.value === value)
}
