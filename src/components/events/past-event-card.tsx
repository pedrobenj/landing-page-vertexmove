import { CalendarDays } from "lucide-react"

import { CoverImage } from "@/components/sections"
import { formatApiDateShort } from "@/lib/utils"
import type { PublicEvent } from "@/types/api/event.interface"

interface PastEventCardProps {
  event: PublicEvent
}

/** Edição passada: capa alta, data curta e nome (home e `/corridas/encerradas`). */
export function PastEventCard({ event }: PastEventCardProps) {
  return (
    <article className="flex flex-col gap-3">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-brand-navy-deep shadow-sm">
        <CoverImage src={event.imagemCapaUrl} alt="" sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 78vw" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="flex items-center gap-2 text-xs font-bold tracking-wider text-muted-foreground">
          <CalendarDays aria-hidden="true" className="size-4 text-brand-green-text" />
          <time dateTime={event.dataEvento}>{formatApiDateShort(event.dataEvento)}</time>
        </p>
        <h3 className="font-heading text-lg font-black text-brand-navy-deep">{event.nome}</h3>
      </div>
    </article>
  )
}
