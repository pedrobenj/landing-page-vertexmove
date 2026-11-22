import { RegistrationStatusBadge } from "@/components/admin"
import { formatCurrency } from "@/lib/utils/format-currency"
import type { ApiAdminRegistration } from "@/types/api/admin-registration.interface"

import { KitPickupButton } from "./kit-pickup-button"
import { RegistrationDetailLink } from "./registration-detail-link"
import { RegistrationKitSummary } from "./registration-kit-summary"

interface RegistrationCardProps {
  eventId: number
  registration: ApiAdminRegistration
  canManage: boolean
  onChanged: () => void
}

export function RegistrationCard({ eventId, registration, canManage, onChanged }: RegistrationCardProps) {
  return (
    <li className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold break-words text-brand-navy">{registration.nomeCompleto}</p>
          <p className="text-xs text-muted-foreground tabular-nums">{registration.codigo}</p>
        </div>
        <RegistrationStatusBadge status={registration.status} />
      </div>
      <div className="flex flex-col gap-1 text-sm">
        <p>
          {registration.distancia.nome} · <span className="tabular-nums">{formatCurrency(registration.valorTotalCentavos)}</span>
        </p>
        <RegistrationKitSummary registration={registration} />
      </div>
      <div className="flex flex-col gap-2">
        {canManage && <KitPickupButton eventId={eventId} registration={registration} onDone={onChanged} className="w-full" />}
        <RegistrationDetailLink eventId={eventId} id={registration.id} codigo={registration.codigo} className="w-full" />
      </div>
    </li>
  )
}
