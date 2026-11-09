import type { Metadata } from "next"
import { Suspense } from "react"

import { ProductFormSkeleton } from "../components"

import { NewProductForm } from "./components"

export const metadata: Metadata = { title: "Novo produto" }

export default function NewProductPage() {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold text-brand-navy">Novo produto</h1>
      {/* Lê a sessão (cookies) e o useFieldArray gera ids com crypto.randomUUID() no render: fora do shell estático. */}
      <Suspense fallback={<ProductFormSkeleton />}>
        <NewProductForm />
      </Suspense>
    </section>
  )
}
