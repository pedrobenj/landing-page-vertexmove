import type { ReactNode } from "react"

import type { AdminEvent } from "@/types/api/admin-event.interface"

import { AdminBackLink } from "./admin-back-link"
import { AdminPageHero } from "./admin-page-hero"
import { EventStatusBadge } from "./event-status-badge"

interface AdminEventSubpageHeaderProps {
  event: AdminEvent
  title: string
  description?: string
  /** Ação principal (ex.: "Nova distância"), à direita no desktop. */
  action?: ReactNode
}

/** Faixa navy das páginas de cadastro de uma corrida (distâncias, kits, documentos, inscrições). */
export function AdminEventSubpageHeader({ event, title, description, action }: AdminEventSubpageHeaderProps) {
  return (
    <AdminPageHero
      id="admin-event-subpage-title"
      eyebrow={event.nome}
      title={title}
      description={description}
      badge={<EventStatusBadge status={event.status} />}
      before={<AdminBackLink href={`/admin/eventos/${event.id}`}>Voltar à corrida</AdminBackLink>}
      actions={action}
    />
  )
}
