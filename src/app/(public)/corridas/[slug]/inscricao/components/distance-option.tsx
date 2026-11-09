import { Clock } from "lucide-react"
import type { Ref } from "react"

import { PillBadge } from "@/components/sections"
import { formatCurrency } from "@/lib/utils"
import type { PublicDistance } from "@/types/api/public-event-detail.interface"

import { OptionCard } from "./option-card"

interface DistanceOptionProps {
  distance: PublicDistance
  eventStartTime: string
  inputRef?: Ref<HTMLButtonElement>
}

/** Card de distância: nome (já traz a metragem), largada e preço do lote vigente. Esgotada ou sem lote → desabilitada. */
export function DistanceOption({ distance, eventStartTime, inputRef }: DistanceOptionProps) {
  const { loteVigente, esgotado } = distance
  const unavailable = esgotado || loteVigente === null

  return (
    <OptionCard id={`distance-${distance.id}`} value={String(distance.id)} disabled={unavailable} inputRef={inputRef} className="gap-3 p-5">
      <span className="flex flex-col gap-1 pr-6">
        <span className="font-heading text-2xl font-black text-brand-navy-deep">{distance.nome}</span>
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock aria-hidden="true" className="size-3.5 text-brand-green-text" />
          Largada às {distance.horarioLargada ?? eventStartTime}
        </span>
      </span>
      {esgotado ? (
        <PillBadge size="sm" className="bg-slate-200 text-slate-700">
          Esgotado
        </PillBadge>
      ) : loteVigente ? (
        <span className="mt-auto flex flex-col">
          <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">{loteVigente.nome}</span>
          <span className="font-heading text-xl font-black text-brand-navy-deep">
            {formatCurrency(loteVigente.precoCentavos)}
          </span>
        </span>
      ) : (
        <span className="text-sm font-semibold text-muted-foreground">Preço em breve</span>
      )}
    </OptionCard>
  )
}
