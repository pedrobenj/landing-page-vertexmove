import { ServerError } from "@/components/feedback"
import { getNextOrder } from "@/lib/utils/next-order"
import { getEmptyPriceTierForm } from "@/lib/utils/price-tier-form-values"
import { isApiError } from "@/server/api/api-error"
import { listPriceTiers } from "@/server/api/endpoints/price-tiers"
import type { Distance } from "@/types/api/distance.interface"
import type { PriceTier } from "@/types/api/price-tier.interface"

import { PriceTierFormDialog } from "./price-tier-form-dialog"
import { PriceTierRow } from "./price-tier-row"

interface PriceTierListProps {
  eventId: number
  distance: Distance
  canManage: boolean
}

/** Lotes de uma distância (o `adminFetch` exige a sessão; a página já chamou `requireAdminSession`). */
export async function PriceTierList({ eventId, distance, canManage }: PriceTierListProps) {
  let tiers: PriceTier[]
  try {
    tiers = await listPriceTiers(distance.id)
  } catch (error) {
    // Só ApiError vira ServerError: o redirect do adminFetch (sessão expirada) sobe.
    if (!isApiError(error)) throw error
    return <ServerError title="Não foi possível carregar os lotes" />
  }

  return (
    <section aria-label={`Lotes de ${distance.nome}`} className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold tracking-wide text-muted-foreground uppercase">Lotes</h3>
        {canManage && (
          <PriceTierFormDialog
            eventId={eventId}
            distance={{ id: distance.id, nome: distance.nome }}
            defaultValues={getEmptyPriceTierForm(getNextOrder(tiers))}
          />
        )}
      </div>
      {tiers.length === 0 ? (
        <p className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
          Nenhum lote cadastrado: a distância não aparece com preço no site.
        </p>
      ) : (
        <ul className="divide-y">
          {tiers.map((tier) => (
            <PriceTierRow key={tier.id} eventId={eventId} distance={distance} tier={tier} canManage={canManage} />
          ))}
        </ul>
      )}
    </section>
  )
}
