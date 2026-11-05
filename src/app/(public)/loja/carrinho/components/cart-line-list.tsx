import type { PricedCartLine } from "@/types/cart.interface"

import { CartLineItem } from "./cart-line-item"

interface CartLineListProps {
  lines: PricedCartLine[]
}

export function CartLineList({ lines }: CartLineListProps) {
  return (
    <ul className="divide-y">
      {lines.map((line) => (
        <CartLineItem key={line.variantId} line={line} />
      ))}
    </ul>
  )
}
