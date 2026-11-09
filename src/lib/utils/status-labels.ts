import { EVENT_STATUS } from "@/enums/event-status.enum"
import { REGISTRATION_STATUS } from "@/enums/registration-status.enum"

const FALLBACK_BADGE = "bg-muted text-muted-foreground"

const EVENT_STATUS_LABELS: Partial<Record<string, string>> = {
  [EVENT_STATUS.DRAFT]: "Rascunho",
  [EVENT_STATUS.PUBLISHED]: "Publicado",
  [EVENT_STATUS.CLOSED]: "Encerrado",
  [EVENT_STATUS.CANCELLED]: "Cancelado",
  [EVENT_STATUS.ARCHIVED]: "Arquivado",
}

const EVENT_STATUS_BADGES: Partial<Record<string, string>> = {
  [EVENT_STATUS.DRAFT]: "bg-muted text-muted-foreground",
  [EVENT_STATUS.PUBLISHED]: "bg-cta text-cta-foreground",
  [EVENT_STATUS.CLOSED]: "bg-primary text-primary-foreground",
  [EVENT_STATUS.CANCELLED]: "bg-destructive/10 text-destructive",
  [EVENT_STATUS.ARCHIVED]: "bg-secondary text-secondary-foreground",
}

const REGISTRATION_STATUS_LABELS: Partial<Record<string, string>> = {
  [REGISTRATION_STATUS.PENDING]: "Pendente",
  [REGISTRATION_STATUS.CONFIRMED]: "Confirmada",
  [REGISTRATION_STATUS.CANCELLED]: "Cancelada",
  [REGISTRATION_STATUS.EXPIRED]: "Expirada",
}

const REGISTRATION_STATUS_BADGES: Partial<Record<string, string>> = {
  [REGISTRATION_STATUS.PENDING]: "bg-secondary text-secondary-foreground",
  [REGISTRATION_STATUS.CONFIRMED]: "bg-cta text-cta-foreground",
  [REGISTRATION_STATUS.CANCELLED]: "bg-destructive/10 text-destructive",
  [REGISTRATION_STATUS.EXPIRED]: "bg-muted text-muted-foreground",
}

/** Aceita `string` porque a lista de status ainda pode mudar no backend (§16). */
export function getEventStatusLabel(status: EVENT_STATUS | string): string {
  return EVENT_STATUS_LABELS[status] ?? status
}

export function getEventStatusBadgeClass(status: EVENT_STATUS | string): string {
  return EVENT_STATUS_BADGES[status] ?? FALLBACK_BADGE
}

export function getRegistrationStatusLabel(status: REGISTRATION_STATUS | string): string {
  return REGISTRATION_STATUS_LABELS[status] ?? status
}

export function getRegistrationStatusBadgeClass(status: REGISTRATION_STATUS | string): string {
  return REGISTRATION_STATUS_BADGES[status] ?? FALLBACK_BADGE
}
