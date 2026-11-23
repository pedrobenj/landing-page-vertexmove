import { LGPD_REQUEST_STATUS } from "@/enums/lgpd-request-status.enum"
import { LGPD_REQUEST_TYPE } from "@/enums/lgpd-request-type.enum"

const FALLBACK_BADGE = "bg-muted text-muted-foreground"

const TYPE_LABELS: Record<LGPD_REQUEST_TYPE, string> = {
  [LGPD_REQUEST_TYPE.ACCESS]: "Acesso aos dados",
  [LGPD_REQUEST_TYPE.CORRECTION]: "Correção de dados",
  [LGPD_REQUEST_TYPE.DELETION]: "Eliminação dos dados",
  [LGPD_REQUEST_TYPE.PORTABILITY]: "Portabilidade",
  [LGPD_REQUEST_TYPE.CONSENT_REVOCATION]: "Revogação do consentimento",
  [LGPD_REQUEST_TYPE.INFORMATION]: "Informação sobre compartilhamento",
}

const STATUS_LABELS: Record<LGPD_REQUEST_STATUS, string> = {
  [LGPD_REQUEST_STATUS.OPEN]: "Aberta",
  [LGPD_REQUEST_STATUS.IN_PROGRESS]: "Em andamento",
  [LGPD_REQUEST_STATUS.FULFILLED]: "Concluída",
  [LGPD_REQUEST_STATUS.REJECTED]: "Recusada",
}

const STATUS_BADGES: Record<LGPD_REQUEST_STATUS, string> = {
  [LGPD_REQUEST_STATUS.OPEN]: "bg-secondary text-secondary-foreground",
  [LGPD_REQUEST_STATUS.IN_PROGRESS]: "bg-primary text-primary-foreground",
  [LGPD_REQUEST_STATUS.FULFILLED]: "bg-cta text-cta-foreground",
  [LGPD_REQUEST_STATUS.REJECTED]: "bg-destructive/10 text-destructive",
}

function lookup<K extends string>(map: Record<K, string>, key: string): string | undefined {
  return (map as Partial<Record<string, string>>)[key]
}

export function getLgpdRequestTypeLabel(tipo: string): string {
  return lookup(TYPE_LABELS, tipo) ?? tipo
}

export function getLgpdRequestStatusLabel(status: string): string {
  return lookup(STATUS_LABELS, status) ?? status
}

export function getLgpdRequestStatusBadge(status: string): string {
  return lookup(STATUS_BADGES, status) ?? FALLBACK_BADGE
}

/** Tipos no formulário público, na ordem dos direitos do art. 18. */
export const LGPD_REQUEST_TYPE_OPTIONS: readonly { value: LGPD_REQUEST_TYPE; label: string }[] = Object.values(LGPD_REQUEST_TYPE).map(
  (tipo) => ({ value: tipo, label: TYPE_LABELS[tipo] }),
)

export type LgpdStatusFilter = LGPD_REQUEST_STATUS | "todos"
export type LgpdTypeFilter = LGPD_REQUEST_TYPE | "todos"

export const LGPD_STATUS_FILTER_OPTIONS: readonly { value: LgpdStatusFilter; label: string }[] = [
  { value: "todos", label: "Todos" },
  ...Object.values(LGPD_REQUEST_STATUS).map((status) => ({ value: status, label: STATUS_LABELS[status] })),
]

export const LGPD_TYPE_FILTER_OPTIONS: readonly { value: LgpdTypeFilter; label: string }[] = [
  { value: "todos", label: "Todos" },
  ...LGPD_REQUEST_TYPE_OPTIONS,
]

export function isLgpdStatusFilter(value: string): value is LgpdStatusFilter {
  return LGPD_STATUS_FILTER_OPTIONS.some((option) => option.value === value)
}

export function isLgpdTypeFilter(value: string): value is LgpdTypeFilter {
  return LGPD_TYPE_FILTER_OPTIONS.some((option) => option.value === value)
}
