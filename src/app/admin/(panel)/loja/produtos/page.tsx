import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"

import { Button } from "@/components/ui/button"

import { ProductsTable, ProductsTableSkeleton } from "./components"

export const metadata: Metadata = { title: "Produtos da loja" }

export default function AdminProductsPage() {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold text-brand-navy">Produtos da loja</h1>
        <Button asChild>
          <Link href="/admin/loja/produtos/novo">Novo produto</Link>
        </Button>
      </div>
      <Suspense fallback={<ProductsTableSkeleton />}>
        <ProductsTable />
      </Suspense>
    </section>
  )
}
