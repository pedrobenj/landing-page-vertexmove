import type { Metadata } from "next"
import { notFound, unstable_rethrow } from "next/navigation"

import { ServerError } from "@/components/feedback"
import { SectionBand } from "@/components/sections"
import { StoreUnavailable } from "@/components/store"
import { isOrderCode } from "@/lib/utils"
import { isApiError } from "@/server/api/api-error"
import { getStoreOrder } from "@/server/api/endpoints/store"
import { isStoreUnavailable } from "@/server/api/is-store-unavailable"
import type { OrderSummary } from "@/types/order.interface"

import { FinishCheckoutOnMount, OrderDetails } from "./components"

export const metadata: Metadata = { title: "Meu pedido", robots: { index: false } }

/** Bloqueia (sem <Suspense>) para que o notFound() rode antes do streaming e devolva 404 de verdade. */
export const instant = false

export default async function OrderPage({ params }: PageProps<"/pedido/[code]">) {
  const code = (await params).code.toUpperCase()
  if (!isOrderCode(code)) notFound()

  let order: OrderSummary | null = null
  let failure: "unavailable" | "error" | null = null
  try {
    order = await getStoreOrder(code)
  } catch (error) {
    unstable_rethrow(error)
    if (isApiError(error) && error.status === 404) notFound()
    if (isStoreUnavailable(error)) failure = "unavailable"
    else {
      console.error("[OrderPage]", error instanceof Error ? error.name : "erro desconhecido")
      failure = "error"
    }
  }

  return (
    <SectionBand className="border-t-0" containerClassName="max-w-2xl">
      {order && (
        <>
          <FinishCheckoutOnMount code={order.code} />
          <OrderDetails order={order} />
        </>
      )}
      {failure === "unavailable" && <StoreUnavailable />}
      {failure === "error" && <ServerError title="Não foi possível carregar o pedido" />}
    </SectionBand>
  )
}
