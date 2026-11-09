"use client"

import { Trash2 } from "lucide-react"
import Link from "next/link"

import { ProductImage, QuantityStepper } from "@/components/store"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { MAX_QUANTITY_PER_ITEM } from "@/lib/utils/constants"
import { selectItemQuantity, useCartStore } from "@/stores/cart-store"
import type { PricedCartLine } from "@/types/cart.interface"

interface CartLineItemProps {
  line: PricedCartLine
}

export function CartLineItem({ line }: CartLineItemProps) {
  const setQuantity = useCartStore((state) => state.setQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  // Quantidade atual do carrinho (não a da última resposta do servidor), para cliques rápidos somarem certo.
  const quantity = useCartStore((state) => selectItemQuantity(state, line.variantId))

  // Removido do carrinho: some na hora, sem esperar o servidor recalcular.
  if (quantity === 0) return null

  return (
    <li className="flex gap-4 py-4">
      <ProductImage src={line.imageUrl} alt={line.productName} type={line.productType} className="w-20 shrink-0 sm:w-24" sizes="96px" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link href={`/loja/${line.productSlug}`} className="font-heading font-black text-brand-navy-deep hover:underline">
              {line.productName}
            </Link>
            <p className="text-sm text-muted-foreground">
              Tamanho: {line.variantLabel} · {formatCurrency(line.unitPrice)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-lg"
            className="size-11 shrink-0 sm:size-9"
            aria-label={`Remover ${line.productName} (${line.variantLabel})`}
            onClick={() => removeItem(line.variantId)}
          >
            <Trash2 />
          </Button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <QuantityStepper
            value={quantity}
            max={MAX_QUANTITY_PER_ITEM}
            onChange={(quantity) => setQuantity(line.variantId, quantity)}
            label={`Quantidade de ${line.productName} (${line.variantLabel})`}
          />
          <span className="font-semibold tabular-nums">{formatCurrency(line.lineTotal)}</span>
        </div>
      </div>
    </li>
  )
}
