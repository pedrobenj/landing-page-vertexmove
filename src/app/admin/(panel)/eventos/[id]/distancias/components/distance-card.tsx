import { Suspense } from "react"

import { Badge } from "@/components/ui/badge"
import { toDistanceFormValues } from "@/lib/utils/distance-form-values"
import { formatDistance } from "@/lib/utils/format-distance"
import type { Distance } from "@/types/api/distance.interface"

import { DistanceFormDialog } from "./distance-form-dialog"
import { PriceTierList } from "./price-tier-list"
import { PriceTierListSkeleton } from "./price-tier-list-skeleton"

interface DistanceCardProps {
  eventId: number
  distance: Distance
  canManage: boolean
}

export function DistanceCard({ eventId, distance, canManage }: DistanceCardProps) {
  return (
    <li>
      <article aria-labelledby={`distance-${distance.id}-title`} className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id={`distance-${distance.id}-title`} className="font-heading text-xl font-extrabold text-brand-navy">
                {distance.nome}
              </h2>
              <Badge variant={distance.ativo ? "default" : "outline"}>{distance.ativo ? "Ativa" : "Inativa"}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {formatDistance(distance.distanciaMetros)} · {distance.capacidadeTotal} vagas
              {distance.horarioLargada && ` · largada ${distance.horarioLargada}`} · ordem {distance.ordem}
            </p>
            {distance.descricao && <p className="text-sm text-foreground">{distance.descricao}</p>}
          </div>
          {canManage && (
            <DistanceFormDialog
              eventId={eventId}
              distance={{ id: distance.id, nome: distance.nome }}
              defaultValues={toDistanceFormValues(distance)}
            />
          )}
        </header>
        <Suspense fallback={<PriceTierListSkeleton />}>
          <PriceTierList eventId={eventId} distance={distance} canManage={canManage} />
        </Suspense>
      </article>
    </li>
  )
}
