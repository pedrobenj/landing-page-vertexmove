import { formatCurrency } from "@/lib/utils/format-currency"
import type { ApiStoreOrderItem } from "@/types/api/store-order.interface"

interface StoreOrderItemRowProps {
  item: ApiStoreOrderItem
}

export function StoreOrderItemRow({ item }: StoreOrderItemRowProps) {
  return (
    <li className="flex justify-between gap-4 py-2 text-sm">
      <span>
        {item.produtoNome} ({item.varianteRotulo}) × {item.quantidade}
      </span>
      <span className="tabular-nums">{formatCurrency(item.precoUnitarioCentavos * item.quantidade)}</span>
    </li>
  )
}
