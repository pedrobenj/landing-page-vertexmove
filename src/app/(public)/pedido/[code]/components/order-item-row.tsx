import { formatCurrency } from "@/lib/utils"
import type { OrderSummaryLine } from "@/types/order.interface"

interface OrderItemRowProps {
  item: OrderSummaryLine
}

export function OrderItemRow({ item }: OrderItemRowProps) {
  return (
    <li className="flex justify-between gap-4 py-2 text-sm">
      <span>
        {item.quantity}× {item.productName} <span className="text-muted-foreground">({item.variantLabel})</span>
      </span>
      <span className="tabular-nums">{formatCurrency(item.unitPrice * item.quantity)}</span>
    </li>
  )
}
