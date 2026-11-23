import { Badge } from "@/components/ui/badge"
import type { LGPD_REQUEST_STATUS } from "@/enums/lgpd-request-status.enum"
import { getLgpdRequestStatusBadge, getLgpdRequestStatusLabel } from "@/lib/utils/lgpd-labels"

interface LgpdStatusBadgeProps {
  status: LGPD_REQUEST_STATUS | string
}

export function LgpdStatusBadge({ status }: LgpdStatusBadgeProps) {
  return <Badge className={getLgpdRequestStatusBadge(status)}>{getLgpdRequestStatusLabel(status)}</Badge>
}
