import { RegistrationStatusBadge } from "@/components/admin"
import { getReasonLabel, getStatusOriginLabel } from "@/lib/utils/admin-registration-labels"
import { formatDateTimeSafe } from "@/lib/utils/format-date"
import type { ApiAdminRegistrationStatusChange } from "@/types/api/admin-registration.interface"

interface RegistrationHistoryItemProps {
  change: ApiAdminRegistrationStatusChange
}

export function RegistrationHistoryItem({ change }: RegistrationHistoryItemProps) {
  return (
    <li className="flex flex-col gap-1 py-2 text-sm">
      <div className="flex items-center justify-between gap-4">
        <RegistrationStatusBadge status={change.statusNovo} />
        <span className="text-muted-foreground tabular-nums">{formatDateTimeSafe(change.em)}</span>
      </div>
      <p className="text-xs text-muted-foreground">
        {getStatusOriginLabel(change.origem)}
        {change.motivo && ` · ${getReasonLabel(change.motivo)}`}
      </p>
    </li>
  )
}
