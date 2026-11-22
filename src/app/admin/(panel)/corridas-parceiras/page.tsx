import type { Metadata } from "next"
import { Suspense } from "react"

import { AdminPageBody, AdminPageHero } from "@/components/admin"

import { PartnerRacesTable, PartnerRacesTableSkeleton } from "./components"

export const metadata: Metadata = { title: "Corridas parceiras" }

export default function AdminPartnerRacesPage() {
  return (
    <>
      <AdminPageHero
        id="admin-partner-races-title"
        eyebrow="Outras trilhas"
        title="Corridas parceiras"
        description="Corridas de outras organizações com cupom exclusivo do Vertex. Só as ativas e futuras aparecem no site, pela ordem."
      />
      <AdminPageBody>
        <Suspense fallback={<PartnerRacesTableSkeleton />}>
          <PartnerRacesTable />
        </Suspense>
      </AdminPageBody>
    </>
  )
}
