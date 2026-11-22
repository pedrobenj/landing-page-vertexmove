import { Badge } from "@/components/ui/badge"
import type { PAYMENT_STATUS } from "@/enums/payment-status.enum"
import { getPaymentStatusBadgeClass, getPaymentStatusLabel } from "@/lib/utils/status-labels"

interface PaymentStatusBadgeProps {
  status: PAYMENT_STATUS | string
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  return <Badge className={getPaymentStatusBadgeClass(status)}>{getPaymentStatusLabel(status)}</Badge>
}
