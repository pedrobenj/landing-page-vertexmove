import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ServerError } from "@/components/feedback"
import { getStoreRepository } from "@/server/repositories/store.repository"
import type { OrderSummary } from "@/types/order.interface"

import { OrderDetails } from "./components"

export const metadata: Metadata = { title: "Meu pedido", robots: { index: false } }

/** Bloqueia (sem <Suspense>) para que o notFound() rode antes do streaming e devolva 404 de verdade. */
export const instant = false

const ORDER_CODE_PATTERN = /^VTX-P-[2-9A-Z]{4}$/

export default async function OrderPage({ params }: PageProps<"/pedido/[code]">) {
  const code = decodeURIComponent((await params).code).toUpperCase()
  if (!ORDER_CODE_PATTERN.test(code)) notFound()

  let order: OrderSummary | null
  try {
    order = await getStoreRepository().getOrderSummaryByCode(code)
  } catch (error) {
    console.error("[OrderPage]", error)
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <ServerError title="Não foi possível carregar o pedido" />
      </div>
    )
  }
  if (!order) notFound()

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <OrderDetails order={order} />
    </div>
  )
}
