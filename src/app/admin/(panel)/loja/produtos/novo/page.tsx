import type { Metadata } from "next"
import { Suspense } from "react"

import { EMPTY_PRODUCT_FORM } from "@/lib/utils"

import { ProductForm, ProductFormSkeleton } from "../components"

export const metadata: Metadata = { title: "Novo produto" }

export default function NewProductPage() {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold text-brand-navy">Novo produto</h1>
      {/* O useFieldArray gera ids com crypto.randomUUID() no render: fica fora do shell estático. */}
      <Suspense fallback={<ProductFormSkeleton />}>
        <ProductForm defaultValues={EMPTY_PRODUCT_FORM} />
      </Suspense>
    </section>
  )
}
