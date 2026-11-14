import { ExternalLink } from "lucide-react"
import Link from "next/link"

import { AdminBackLink, AdminPageHero, EventStatusBadge } from "@/components/admin"
import { Button } from "@/components/ui/button"
import { EVENT_STATUS } from "@/enums/event-status.enum"
import { formatApiDate } from "@/lib/utils/format-api-date"
import type { AdminEvent } from "@/types/api/admin-event.interface"

interface AdminEventHeaderProps {
  event: AdminEvent
}

/** Faixa navy da corrida: nome, status, data/local e "Ver no site" quando publicada. */
export function AdminEventHeader({ event }: AdminEventHeaderProps) {
  return (
    <AdminPageHero
      id="admin-event-title"
      eyebrow="Corrida"
      title={event.nome}
      badge={<EventStatusBadge status={event.status} />}
      description={`${formatApiDate(event.dataEvento)} · ${event.horarioLargada} · ${event.localizacaoResumo}`}
      before={<AdminBackLink href="/admin/eventos">Suas provas</AdminBackLink>}
      actions={
        event.status === EVENT_STATUS.PUBLISHED && (
          <Button asChild variant="outline">
            <Link href={`/corridas/${event.slug}`} target="_blank" rel="noopener noreferrer">
              Ver no site <ExternalLink aria-hidden="true" />
              <span className="sr-only">(abre em nova aba)</span>
            </Link>
          </Button>
        )
      }
    />
  )
}
