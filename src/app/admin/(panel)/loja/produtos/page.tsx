import type { Metadata } from "next"
import { Suspense } from "react"

import { AdminPageBody, AdminPageHero } from "@/components/admin"

import { ProductsTable, ProductsTableSkeleton } from "./components"

export const metadata: Metadata = { title: "Produtos da loja" }

export default function AdminProductsPage() {
  return (
    <>
      <AdminPageHero
        id="admin-products-title"
        eyebrow="Loja"
        title="Produtos da loja"
        description="Camisas, viseiras e acessórios. O Vertex não vende medalhas."
      />
      <AdminPageBody>
        <Suspense fallback={<ProductsTableSkeleton />}>
          <ProductsTable />
        </Suspense>
      </AdminPageBody>
    </>
  )
}
