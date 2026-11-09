import { ArrowLeft, ExternalLink } from "lucide-react"
import Link from "next/link"

import { EventStatusBadge } from "@/components/admin"
import { EVENT_STATUS } from "@/enums/event-status.enum"
import { formatApiDate } from "@/lib/utils/format-api-date"
import type { AdminEvent } from "@/types/api/admin-event.interface"

interface AdminEventHeaderProps {
  event: AdminEvent
}

export function AdminEventHeader({ event }: AdminEventHeaderProps) {
  return (
    <div className="flex flex-col gap-3">
      <Link href="/admin/eventos" className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-brand-navy">
        <ArrowLeft className="size-4" aria-hidden="true" /> Corridas
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-extrabold text-brand-navy">{event.nome}</h1>
        <EventStatusBadge status={event.status} />
      </div>
      <p className="text-sm text-muted-foreground">
        {formatApiDate(event.dataEvento)} · {event.horarioLargada} · {event.localizacaoResumo}
      </p>
      {event.status === EVENT_STATUS.PUBLISHED && (
        <Link
          href={`/corridas/${event.slug}`}
          target="_blank"
          className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-brand-navy hover:underline"
        >
          Ver no site <ExternalLink className="size-4" aria-hidden="true" />
          <span className="sr-only">(abre em nova aba)</span>
        </Link>
      )}
    </div>
  )
}
