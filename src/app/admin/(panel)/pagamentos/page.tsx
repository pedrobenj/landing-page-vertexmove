import type { Metadata } from "next"
import { Suspense } from "react"

import { AdminPageBody, AdminPageHero } from "@/components/admin"

import { AdminPaymentsList, PaymentsTableSkeleton } from "./components"

export const metadata: Metadata = { title: "Pagamentos" }

/** Fila de pagamentos que pedem ação: em análise, estorno pendente e valor divergente. */
export default function AdminPaymentsPage() {
  return (
    <>
      <AdminPageHero
        id="admin-payments-title"
        eyebrow="Financeiro"
        title="Pagamentos"
        description="Concilie com o Mercado Pago e resolva estornos pendentes."
      />
      <AdminPageBody>
        <Suspense fallback={<PaymentsTableSkeleton />}>
          <AdminPaymentsList />
        </Suspense>
      </AdminPageBody>
    </>
  )
}
