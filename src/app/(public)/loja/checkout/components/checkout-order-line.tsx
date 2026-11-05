import { formatCurrency } from "@/lib/utils"
import type { PricedCartLine } from "@/types/cart.interface"

interface CheckoutOrderLineProps {
  line: PricedCartLine
}

export function CheckoutOrderLine({ line }: CheckoutOrderLineProps) {
  return (
    <li className="flex justify-between gap-4 text-sm">
      <span>
        {line.quantity}× {line.productName} <span className="text-muted-foreground">({line.variantLabel})</span>
      </span>
      <span className="font-medium tabular-nums">{formatCurrency(line.lineTotal)}</span>
    </li>
  )
}
