import type { Metadata } from "next"
import { Suspense } from "react"

import { AdminPageBody, AdminPageHero } from "@/components/admin"

import { AdminLgpdList, LgpdRequestsTableSkeleton } from "./components"

export const metadata: Metadata = { title: "LGPD" }

/** Solicitações dos titulares (acesso, correção, eliminação...) abertas em `/privacidade/solicitacao`. */
export default function AdminLgpdPage() {
  return (
    <>
      <AdminPageHero
        id="admin-lgpd-title"
        eyebrow="Privacidade"
        title="Solicitações LGPD"
        description="Pedidos dos titulares de dados. Responda dentro do prazo de cada solicitação."
      />
      <AdminPageBody>
        <Suspense fallback={<LgpdRequestsTableSkeleton />}>
          <AdminLgpdList />
        </Suspense>
      </AdminPageBody>
    </>
  )
}
