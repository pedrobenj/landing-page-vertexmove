import { Badge } from "@/components/ui/badge"
import type { EVENT_STATUS } from "@/enums/event-status.enum"
import { cn } from "@/lib/utils"
import { getEventStatusBadgeClass, getEventStatusLabel } from "@/lib/utils/status-labels"

interface EventStatusBadgeProps {
  status: EVENT_STATUS | string
  className?: string
}

export function EventStatusBadge({ status, className }: EventStatusBadgeProps) {
  return <Badge className={cn(getEventStatusBadgeClass(status), className)}>{getEventStatusLabel(status)}</Badge>
}
