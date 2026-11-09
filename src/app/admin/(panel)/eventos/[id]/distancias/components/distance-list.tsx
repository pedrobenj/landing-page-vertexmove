import { Route } from "lucide-react"

import { EmptyState, ServerError } from "@/components/feedback"
import { getEmptyDistanceForm } from "@/lib/utils/distance-form-values"
import { getNextOrder } from "@/lib/utils/next-order"
import { isApiError } from "@/server/api/api-error"
import { listDistances } from "@/server/api/endpoints/distances"
import type { Distance } from "@/types/api/distance.interface"

import { DistanceCard } from "./distance-card"
import { DistanceFormDialog } from "./distance-form-dialog"

interface DistanceListProps {
  eventId: number
  canManage: boolean
}

/** Distâncias da corrida em cards (a API já devolve por `ordem`), cada uma com seus lotes. */
export async function DistanceList({ eventId, canManage }: DistanceListProps) {
  let distances: Distance[]
  try {
    distances = await listDistances(eventId)
  } catch (error) {
    // Só ApiError vira ServerError: o redirect do adminFetch (sessão expirada) sobe.
    if (!isApiError(error)) throw error
    return <ServerError title="Não foi possível carregar as distâncias" />
  }

  const newDistance = canManage ? (
    <DistanceFormDialog eventId={eventId} defaultValues={getEmptyDistanceForm(getNextOrder(distances))} />
  ) : undefined

  if (distances.length === 0) {
    return (
      <EmptyState
        icon={Route}
        title="Nenhuma distância cadastrada."
        description={canManage ? "Cadastre as distâncias (ex.: 5 km, 10 km) e os lotes de preço de cada uma." : undefined}
        action={newDistance}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {newDistance && <div className="flex justify-end">{newDistance}</div>}
      <ul className="flex flex-col gap-4">
        {distances.map((distance) => (
          <DistanceCard key={distance.id} eventId={eventId} distance={distance} canManage={canManage} />
        ))}
      </ul>
    </div>
  )
}
