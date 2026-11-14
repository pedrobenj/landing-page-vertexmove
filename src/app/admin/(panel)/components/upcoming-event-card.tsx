import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { EventStatusBadge } from "@/components/admin"
import { cn } from "@/lib/utils"
import { formatApiDate } from "@/lib/utils/format-api-date"
import { getReadinessSummary } from "@/lib/utils/get-readiness-summary"
import { READINESS_ITEMS } from "@/lib/utils/readiness-items"
import type { EventReadinessResult } from "@/server/api/load-event-readiness"
import type { AdminEvent } from "@/types/api/admin-event.interface"

import { ReadinessCheckItem } from "./readiness-check-item"

interface UpcomingEventCardProps {
  event: AdminEvent
  result: EventReadinessResult
}

/** Corrida do "Próximos topos": dados, status e o checklist do que falta para abrir inscrições. */
export function UpcomingEventCard({ event, result }: UpcomingEventCardProps) {
  const titleId = `upcoming-event-${event.id}`
  return (
    <li>
      <article aria-labelledby={titleId} className="flex h-full flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm">
        <header className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <h3 id={titleId} className="font-heading text-lg leading-tight font-extrabold text-brand-navy-deep">
              {event.nome}
            </h3>
            <EventStatusBadge status={event.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {formatApiDate(event.dataEvento)} · {event.horarioLargada} · {event.localizacaoResumo}
          </p>
        </header>

        {"error" in result ? (
          <p role="alert" className="text-sm text-destructive">
            Não foi possível verificar esta prova.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            <p
              className={cn(
                "w-fit rounded-full px-3 py-1 text-xs font-bold",
                result.readiness.ready ? "bg-brand-green/15 text-brand-green-text" : "bg-destructive/10 text-destructive",
              )}
            >
              {getReadinessSummary(result.readiness, event.status)}
            </p>
            <ul aria-label={`Checklist de ${event.nome}`} className="flex flex-col gap-1.5">
              {READINESS_ITEMS.map((config) => (
                <ReadinessCheckItem
                  key={config.item}
                  config={config}
                  done={!result.readiness.missing.includes(config.item)}
                  eventId={event.id}
                />
              ))}
            </ul>
          </div>
        )}

        <Link
          href={`/admin/eventos/${event.id}`}
          className="mt-auto inline-flex w-fit items-center gap-1 text-sm font-semibold text-brand-navy hover:underline"
        >
          Gerenciar <ArrowRight className="size-4" aria-hidden="true" />
          <span className="sr-only">{event.nome}</span>
        </Link>
      </article>
    </li>
  )
}
