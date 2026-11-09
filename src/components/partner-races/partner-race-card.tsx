import { CalendarDays, ExternalLink, MapPin, Route } from "lucide-react"

import { CoverImage, PillBadge } from "@/components/sections"
import { Button } from "@/components/ui/button"
import { formatApiDate, joinDistances } from "@/lib/utils"
import type { PartnerRace } from "@/types/api/partner-race.interface"

import { PartnerRaceCoupon } from "./partner-race-coupon"

interface PartnerRaceCardProps {
  race: PartnerRace
}

/** Corrida de outra organização com cupom exclusivo do Vertex (home e `/corridas-parceiras`). */
export function PartnerRaceCard({ race }: PartnerRaceCardProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="relative aspect-[4/3] overflow-hidden bg-brand-navy-deep">
        <CoverImage src={race.imagemCapaUrl} alt={race.nome} sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw" />
        <PillBadge size="sm" className="absolute top-3 left-3">
          Inscrições abertas
        </PillBadge>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex flex-col gap-2">
          <h3 className="font-heading text-lg font-black text-brand-navy-deep">{race.nome}</h3>
          <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <CalendarDays aria-hidden="true" className="size-4 shrink-0 text-brand-green-text" />
              <time dateTime={race.dataEvento}>{formatApiDate(race.dataEvento)}</time>
            </li>
            <li className="flex items-center gap-2">
              <MapPin aria-hidden="true" className="size-4 shrink-0 text-brand-green-text" />
              {race.localNome} • {race.cidade}/{race.uf}
            </li>
            {race.distancias.length > 0 && (
              <li className="flex items-center gap-2">
                <Route aria-hidden="true" className="size-4 shrink-0 text-brand-green-text" />
                {joinDistances(race.distancias)}
              </li>
            )}
          </ul>
          {race.realizacao && <p className="text-xs text-muted-foreground">Por {race.realizacao}</p>}
        </div>

        <PartnerRaceCoupon code={race.cupom} discountPercent={race.descontoPercentual} />

        <Button asChild variant="cta" size="lg" className="mt-auto h-11 w-full rounded-xl normal-case">
          <a href={race.urlInscricao} target="_blank" rel="noopener noreferrer">
            Inscrever-se
            <ExternalLink aria-hidden="true" />
            <span className="sr-only">(abre em nova aba)</span>
          </a>
        </Button>
      </div>
    </article>
  )
}
