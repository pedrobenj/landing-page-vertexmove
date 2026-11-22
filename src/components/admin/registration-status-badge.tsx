import { Badge } from "@/components/ui/badge"
import type { REGISTRATION_STATUS } from "@/enums/registration-status.enum"
import { getRegistrationStatusBadgeClass, getRegistrationStatusLabel } from "@/lib/utils/status-labels"

interface RegistrationStatusBadgeProps {
  status: REGISTRATION_STATUS | string
}

export function RegistrationStatusBadge({ status }: RegistrationStatusBadgeProps) {
  return <Badge className={getRegistrationStatusBadgeClass(status)}>{getRegistrationStatusLabel(status)}</Badge>
}
