import { Badge } from "@/components/ui/badge"
import type { ORDER_STATUS } from "@/enums/order-status.enum"
import { getOrderStatusBadgeClass, getOrderStatusLabel } from "@/lib/utils/status-labels"

interface StoreOrderStatusBadgeProps {
  status: ORDER_STATUS | string
}

export function StoreOrderStatusBadge({ status }: StoreOrderStatusBadgeProps) {
  return <Badge className={getOrderStatusBadgeClass(status)}>{getOrderStatusLabel(status)}</Badge>
}
