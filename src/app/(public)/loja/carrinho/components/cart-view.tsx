"use client"

import { ShoppingBag } from "lucide-react"
import Link from "next/link"

import { EmptyState, ServerError } from "@/components/feedback"
import { Button } from "@/components/ui/button"
import { usePricedCart } from "@/hooks/data/use-priced-cart"

import { CartLineList } from "./cart-line-list"
import { CartSkeleton } from "./cart-skeleton"
import { CartSummary } from "./cart-summary"

export function CartView() {
  const { data, isPending, isError, isEmpty, hydrated } = usePricedCart()

  if (isEmpty) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Seu carrinho está vazio."
        description="Escolha camisas e medalhas na loja."
        action={
          <Button asChild variant="cta" size="lg">
            <Link href="/loja">Ver produtos</Link>
          </Button>
        }
      />
    )
  }
  if (!hydrated || isPending) return <CartSkeleton />
  if (isError || !data) return <ServerError title="Não foi possível carregar o carrinho" />

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
      <CartLineList lines={data.lines} />
      <CartSummary itemCount={data.itemCount} total={data.total}>
        <Button asChild variant="cta" size="xl" className="w-full">
          <Link href="/loja/checkout">Finalizar compra</Link>
        </Button>
        <Button asChild variant="ghost" className="w-full">
          <Link href="/loja">Continuar comprando</Link>
        </Button>
      </CartSummary>
    </div>
  )
}
