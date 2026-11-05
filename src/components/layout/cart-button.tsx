"use client"

import { ShoppingBag } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { useCartHydrated } from "@/hooks/use-cart-hydrated"
import { selectCartCount, useCartStore } from "@/stores/cart-store"

export function CartButton() {
  const hydrated = useCartHydrated()
  const count = useCartStore(selectCartCount)
  const visibleCount = hydrated ? count : 0

  return (
    <Button asChild variant="ghost" size="icon-lg" className="relative">
      <Link href="/loja/carrinho" aria-label={`Carrinho, ${visibleCount} ${visibleCount === 1 ? "item" : "itens"}`}>
        <ShoppingBag className="size-5" aria-hidden="true" />
        {visibleCount > 0 && (
          <span
            data-testid="cart-count"
            className="absolute -top-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-cta text-[0.7rem] font-bold text-cta-foreground"
          >
            {visibleCount}
          </span>
        )}
      </Link>
    </Button>
  )
}
