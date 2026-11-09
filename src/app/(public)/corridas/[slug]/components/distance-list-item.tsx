import { Clock, ExternalLink, Ruler } from "lucide-react"

import { PillBadge } from "@/components/sections"
import { cn, formatCurrency, formatDistance } from "@/lib/utils"
import type { PublicDistance } from "@/types/api/public-event-detail.interface"

interface DistanceListItemProps {
  distance: PublicDistance
  /** Largada geral do evento, usada quando a distância não tem horário próprio. */
  eventStartTime: string
}

/** Card de distância: nome, metragem, largada, lote vigente com preço em destaque e selo "Esgotado". */
export function DistanceListItem({ distance, eventStartTime }: DistanceListItemProps) {
  const { loteVigente, esgotado } = distance
  const startTime = distance.horarioLargada ?? eventStartTime

  return (
    <li>
      <article
        aria-label={distance.nome}
        className={cn(
          "flex h-full flex-col gap-5 rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md",
          esgotado && "bg-slate-50 hover:shadow-sm",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className={cn("font-heading text-3xl font-black text-brand-navy-deep", esgotado && "text-slate-500")}>
            {distance.nome}
          </h3>
          {esgotado ? (
            <PillBadge size="sm" className="shrink-0 bg-slate-200 text-slate-700">
              Esgotado
            </PillBadge>
          ) : null}
        </div>

        {distance.descricao && <p className="text-sm text-muted-foreground">{distance.descricao}</p>}

        <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <Ruler aria-hidden="true" className="size-4 shrink-0 text-brand-green-text" />
            Percurso de {formatDistance(distance.distanciaMetros)}
          </li>
          <li className="flex items-center gap-2">
            <Clock aria-hidden="true" className="size-4 shrink-0 text-brand-green-text" />
            <span>
              Largada às <time dateTime={startTime}>{startTime}</time>
            </span>
          </li>
        </ul>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 border-t pt-4">
          {esgotado ? (
            <p className="text-sm font-semibold text-slate-600">Vagas esgotadas para esta distância.</p>
          ) : loteVigente ? (
            <p className="flex flex-col">
              <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                {loteVigente.nome}
              </span>
              <span className="font-heading text-3xl font-black text-brand-navy-deep">
                {formatCurrency(loteVigente.precoCentavos)}
              </span>
            </p>
          ) : (
            <p className="text-sm font-semibold text-muted-foreground">Preço em breve</p>
          )}
          {distance.percursoUrl && (
            <a
              href={distance.percursoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-bold text-brand-green-text underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green"
            >
              Ver percurso
              <ExternalLink aria-hidden="true" className="size-3.5" />
              <span className="sr-only">de {distance.nome} (abre em nova aba)</span>
            </a>
          )}
        </div>
      </article>
    </li>
  )
}
