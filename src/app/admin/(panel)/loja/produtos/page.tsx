import type { Metadata } from "next"
import { Suspense } from "react"

import { ProductsTable, ProductsTableSkeleton } from "./components"

export const metadata: Metadata = { title: "Produtos da loja" }

export default function AdminProductsPage() {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold text-brand-navy">Produtos da loja</h1>
      <Suspense fallback={<ProductsTableSkeleton />}>
        <ProductsTable />
      </Suspense>
    </section>
  )
}
