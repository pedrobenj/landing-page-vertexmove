import { EVENT_STATUS } from "@/enums/event-status.enum"

import { getEventStatusLabel } from "./status-labels"

export interface EventStatusFilterOption {
  value: EVENT_STATUS | "todos"
  label: string
}

/** Opções do filtro de status da lista de corridas do admin. */
export const EVENT_STATUS_FILTER_OPTIONS: readonly EventStatusFilterOption[] = [
  { value: "todos", label: "Todos" },
  ...Object.values(EVENT_STATUS).map((status) => ({ value: status, label: getEventStatusLabel(status) })),
]

export function isEventStatusFilter(value: string): value is EventStatusFilterOption["value"] {
  return EVENT_STATUS_FILTER_OPTIONS.some((option) => option.value === value)
}
