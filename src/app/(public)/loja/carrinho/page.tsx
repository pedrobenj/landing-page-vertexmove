import type { Metadata } from "next"

import { CartView } from "./components"

export const metadata: Metadata = { title: "Carrinho", robots: { index: false } }

export default function CartPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10">
      <h1 className="text-3xl font-extrabold text-brand-navy uppercase">Carrinho</h1>
      <CartView />
    </div>
  )
}
