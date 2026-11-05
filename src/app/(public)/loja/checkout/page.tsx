import type { Metadata } from "next"

import { CheckoutView } from "./components"

export const metadata: Metadata = { title: "Finalizar compra", robots: { index: false } }

export default function CheckoutPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10">
      <h1 className="text-3xl font-extrabold text-brand-navy uppercase">Finalizar compra</h1>
      <CheckoutView />
    </div>
  )
}
