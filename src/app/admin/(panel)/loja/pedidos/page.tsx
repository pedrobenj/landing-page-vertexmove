import type { Metadata } from "next"
import { Suspense } from "react"

import { AdminPageBody, AdminPageHero } from "@/components/admin"

import { AdminStoreOrdersList, StoreOrdersTableSkeleton } from "./components"

export const metadata: Metadata = { title: "Pedidos da loja" }

export default function AdminStoreOrdersPage() {
  return (
    <>
      <AdminPageHero
        id="admin-store-orders-title"
        eyebrow="Loja"
        title="Pedidos da loja"
        description="Acompanhe pagamentos, separe os itens e registre a retirada."
      />
      <AdminPageBody>
        <Suspense fallback={<StoreOrdersTableSkeleton />}>
          <AdminStoreOrdersList />
        </Suspense>
      </AdminPageBody>
    </>
  )
}
