import { RegistrationStatusBadge } from "@/components/admin"
import { TableCell, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils/format-currency"
import type { ApiAdminRegistration } from "@/types/api/admin-registration.interface"

import { KitPickupButton } from "./kit-pickup-button"
import { RegistrationDetailLink } from "./registration-detail-link"
import { RegistrationKitSummary } from "./registration-kit-summary"

interface RegistrationsTableRowProps {
  eventId: number
  registration: ApiAdminRegistration
  canManage: boolean
  onChanged: () => void
}

export function RegistrationsTableRow({ eventId, registration, canManage, onChanged }: RegistrationsTableRowProps) {
  return (
    <TableRow>
      <TableCell className="whitespace-normal">
        <p className="font-semibold text-brand-navy">{registration.nomeCompleto}</p>
        <p className="text-xs text-muted-foreground tabular-nums">
          {registration.codigo}
          {registration.cpfMascarado && ` · CPF ${registration.cpfMascarado}`}
        </p>
      </TableCell>
      <TableCell>{registration.distancia.nome}</TableCell>
      <TableCell className="whitespace-normal">
        <RegistrationKitSummary registration={registration} />
      </TableCell>
      <TableCell className="tabular-nums">{formatCurrency(registration.valorTotalCentavos)}</TableCell>
      <TableCell>
        <RegistrationStatusBadge status={registration.status} />
      </TableCell>
      <TableCell>
        <div className="flex justify-end gap-2">
          {canManage && <KitPickupButton eventId={eventId} registration={registration} onDone={onChanged} />}
          <RegistrationDetailLink eventId={eventId} id={registration.id} codigo={registration.codigo} />
        </div>
      </TableCell>
    </TableRow>
  )
}
