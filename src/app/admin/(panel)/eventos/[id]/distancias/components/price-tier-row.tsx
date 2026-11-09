import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils/format-currency"
import { formatDateTime } from "@/lib/utils/format-date"
import { toPriceTierFormValues } from "@/lib/utils/price-tier-form-values"
import type { Distance } from "@/types/api/distance.interface"
import type { PriceTier } from "@/types/api/price-tier.interface"

import { PriceTierFormDialog } from "./price-tier-form-dialog"

interface PriceTierRowProps {
  eventId: number
  distance: Distance
  tier: PriceTier
  canManage: boolean
}

export function PriceTierRow({ eventId, distance, tier, canManage }: PriceTierRowProps) {
  return (
    <li className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-foreground">{tier.nome}</p>
          <p className="font-heading font-bold text-brand-navy tabular-nums">{formatCurrency(tier.precoCentavos)}</p>
          {!tier.ativo && <Badge variant="outline">Inativo</Badge>}
        </div>
        <p className="text-xs text-muted-foreground tabular-nums">
          {formatDateTime(tier.inicioEm)} até {formatDateTime(tier.fimEm)}
          {" · "}
          {tier.quantidadeTotal === null ? "sem limite próprio" : `${tier.quantidadeTotal} inscrições`}
        </p>
      </div>
      {canManage && (
        <PriceTierFormDialog
          eventId={eventId}
          distance={{ id: distance.id, nome: distance.nome }}
          priceTier={{ id: tier.id, nome: tier.nome }}
          defaultValues={toPriceTierFormValues(tier)}
        />
      )}
    </li>
  )
}
