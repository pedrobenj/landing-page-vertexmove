import type { PricedCartLine } from "@/types/cart.interface"

import { CartLineItem } from "./cart-line-item"

interface CartLineListProps {
  lines: PricedCartLine[]
}

export function CartLineList({ lines }: CartLineListProps) {
  return (
    <ul className="divide-y rounded-2xl border bg-card px-4 shadow-sm sm:px-5">
      {lines.map((line) => (
        <CartLineItem key={line.variantId} line={line} />
      ))}
    </ul>
  )
}
