import { ADMIN_ROLE } from "@/enums/admin-role.enum"
import { EVENT_STATUS } from "@/enums/event-status.enum"
import { REGISTRATION_STATUS } from "@/enums/registration-status.enum"

const FALLBACK_BADGE = "bg-muted text-muted-foreground"

/** Busca num mapa tipado aceitando `string` (status novos do backend caem no fallback). */
function lookup<K extends string>(map: Record<K, string>, key: string): string | undefined {
  return (map as Partial<Record<string, string>>)[key]
}

const EVENT_STATUS_LABELS: Record<EVENT_STATUS, string> = {
  [EVENT_STATUS.DRAFT]: "Rascunho",
  [EVENT_STATUS.PUBLISHED]: "Publicado",
  [EVENT_STATUS.CLOSED]: "Encerrado",
  [EVENT_STATUS.CANCELLED]: "Cancelado",
  [EVENT_STATUS.ARCHIVED]: "Arquivado",
}

const EVENT_STATUS_BADGES: Record<EVENT_STATUS, string> = {
  [EVENT_STATUS.DRAFT]: "bg-muted text-muted-foreground",
  [EVENT_STATUS.PUBLISHED]: "bg-cta text-cta-foreground",
  [EVENT_STATUS.CLOSED]: "bg-primary text-primary-foreground",
  [EVENT_STATUS.CANCELLED]: "bg-destructive/10 text-destructive",
  [EVENT_STATUS.ARCHIVED]: "bg-secondary text-secondary-foreground",
}

const REGISTRATION_STATUS_LABELS: Record<REGISTRATION_STATUS, string> = {
  [REGISTRATION_STATUS.PENDING]: "Pendente",
  [REGISTRATION_STATUS.CONFIRMED]: "Confirmada",
  [REGISTRATION_STATUS.CANCELLED]: "Cancelada",
  [REGISTRATION_STATUS.EXPIRED]: "Expirada",
  [REGISTRATION_STATUS.REFUNDED]: "Estornada",
}

const REGISTRATION_STATUS_BADGES: Record<REGISTRATION_STATUS, string> = {
  [REGISTRATION_STATUS.PENDING]: "bg-secondary text-secondary-foreground",
  [REGISTRATION_STATUS.CONFIRMED]: "bg-cta text-cta-foreground",
  [REGISTRATION_STATUS.CANCELLED]: "bg-destructive/10 text-destructive",
  [REGISTRATION_STATUS.EXPIRED]: "bg-muted text-muted-foreground",
  [REGISTRATION_STATUS.REFUNDED]: "bg-muted text-muted-foreground",
}

/** Aceita `string` porque a lista de status ainda pode mudar no backend (§16). */
export function getEventStatusLabel(status: EVENT_STATUS | string): string {
  return lookup(EVENT_STATUS_LABELS, status) ?? status
}

export function getEventStatusBadgeClass(status: EVENT_STATUS | string): string {
  return lookup(EVENT_STATUS_BADGES, status) ?? FALLBACK_BADGE
}

export function getRegistrationStatusLabel(status: REGISTRATION_STATUS | string): string {
  return lookup(REGISTRATION_STATUS_LABELS, status) ?? status
}

export function getRegistrationStatusBadgeClass(status: REGISTRATION_STATUS | string): string {
  return lookup(REGISTRATION_STATUS_BADGES, status) ?? FALLBACK_BADGE
}

const ADMIN_ROLE_LABELS: Record<ADMIN_ROLE, string> = {
  [ADMIN_ROLE.ADMIN]: "Administrador",
  [ADMIN_ROLE.ORGANIZATION]: "Organização",
  [ADMIN_ROLE.OPERATOR]: "Operador",
  [ADMIN_ROLE.SUPER_ADMIN]: "Super admin",
}

export function getAdminRoleLabel(role: ADMIN_ROLE | string): string {
  return lookup(ADMIN_ROLE_LABELS, role) ?? role
}
