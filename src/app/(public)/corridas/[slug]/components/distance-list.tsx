import { Route } from "lucide-react"

import { EmptyState } from "@/components/feedback"
import type { PublicDistance } from "@/types/api/public-event-detail.interface"

import { DistanceListItem } from "./distance-list-item"

interface DistanceListProps {
  distances: PublicDistance[] | undefined
  eventStartTime: string
}

/** Distâncias com o preço do lote vigente. Sem `distancias` no payload → aviso "em breve". */
export function DistanceList({ distances, eventStartTime }: DistanceListProps) {
  if (!distances || distances.length === 0) {
    return <EmptyState icon={Route} title="Distâncias e preços em breve." description="Volte em breve para garantir sua vaga!" />
  }

  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {distances.map((distance) => (
        <DistanceListItem key={distance.id} distance={distance} eventStartTime={eventStartTime} />
      ))}
    </ul>
  )
}
