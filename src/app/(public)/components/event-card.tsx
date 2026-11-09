import { ArrowRight, CalendarDays, MapPin } from "lucide-react"
import Link from "next/link"

import { CoverImage, PillBadge } from "@/components/sections"
import { Button } from "@/components/ui/button"
import { formatApiDate } from "@/lib/utils"
import type { PublicEvent } from "@/types/api/event.interface"

interface EventCardProps {
  event: PublicEvent
}

/** Corrida aberta. A lista pública não traz distâncias nem preço — só o básico (CLAUDE.md §16). */
export function EventCard({ event }: EventCardProps) {
  const { localizacao } = event

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-video overflow-hidden bg-brand-navy-deep">
        <CoverImage src={event.imagemCapaUrl} alt={event.nome} sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw" />
        <PillBadge size="sm" className="absolute top-3 left-3">
          Inscrições abertas
        </PillBadge>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <h3 className="font-heading text-xl font-black text-brand-navy-deep">{event.nome}</h3>
        <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <CalendarDays aria-hidden="true" className="size-4 shrink-0 text-brand-green-text" />
            <span>
              <time dateTime={event.dataEvento}>{formatApiDate(event.dataEvento)}</time> · Largada {event.horarioLargada}
            </span>
          </li>
          <li className="flex items-center gap-2">
            <MapPin aria-hidden="true" className="size-4 shrink-0 text-brand-green-text" />
            {localizacao.localNome} — {localizacao.cidade}/{localizacao.uf}
          </li>
        </ul>
        <div className="mt-auto flex justify-end pt-2">
          <Button asChild variant="cta" size="lg" className="rounded-xl px-4 normal-case tracking-normal">
            <Link href={`/corridas/${event.slug}`}>
              Inscrever-se
              <span className="sr-only"> em {event.nome}</span>
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  )
}
