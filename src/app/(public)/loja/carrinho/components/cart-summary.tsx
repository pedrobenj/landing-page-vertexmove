import type { ReactNode } from "react"

import { cn, formatCurrency } from "@/lib/utils"

interface CartSummaryProps {
  itemCount: number
  total: number
  /** true enquanto o servidor recalcula o total (mostra o valor anterior esmaecido). */
  isUpdating?: boolean
  children?: ReactNode
}

export function CartSummary({ itemCount, total, isUpdating = false, children }: CartSummaryProps) {
  return (
    <aside aria-label="Resumo do pedido" aria-busy={isUpdating} className="flex flex-col gap-4 rounded-xl border bg-card p-5">
      <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span>{itemCount === 1 ? "1 item" : `${itemCount} itens`}</span>
        <span>Retirada presencial · sem frete</span>
      </div>
      <div className="flex items-baseline justify-between">
        <span className="font-semibold">Total</span>
        <span data-testid="cart-total" className={cn("text-2xl font-extrabold text-brand-navy tabular-nums transition-opacity", isUpdating && "opacity-50")}>
          {formatCurrency(total)}
        </span>
      </div>
      {children}
    </aside>
  )
}
