"use client"

import { ShoppingBag } from "lucide-react"
import Link from "next/link"

import { EmptyState, ServerError } from "@/components/feedback"
import { StoreUnavailable } from "@/components/store"
import { Button } from "@/components/ui/button"
import { usePricedCart } from "@/hooks/data/use-priced-cart"

import { CartSkeleton, CartSummary } from "../../carrinho/components"
import { CheckoutForm } from "./checkout-form"
import { CheckoutOrderLine } from "./checkout-order-line"

export function CheckoutView() {
  const { data, isPending, isError, isEmpty, hydrated, isPlaceholderData, isStoreUnavailable } = usePricedCart()

  if (isEmpty) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Seu carrinho está vazio."
        action={
          <Button asChild variant="cta" size="lg">
            <Link href="/loja">Ver produtos</Link>
          </Button>
        }
      />
    )
  }
  if (isStoreUnavailable) return <StoreUnavailable />
  if (!hydrated || (isPending && !data)) return <CartSkeleton />
  if (isError || !data) return <ServerError title="Não foi possível carregar o resumo do pedido" />

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
      <CheckoutForm />
      <CartSummary itemCount={data.itemCount} total={data.total} isUpdating={isPlaceholderData}>
        <ul className="flex flex-col gap-2 border-t pt-4">
          {data.lines.map((line) => (
            <CheckoutOrderLine key={line.variantId} line={line} />
          ))}
        </ul>
        <p className="text-xs text-muted-foreground">Pagamento via Pix. O estoque fica reservado por 30 minutos.</p>
      </CartSummary>
    </div>
  )
}
