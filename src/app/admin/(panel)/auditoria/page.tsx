import type { Metadata } from "next"
import { Suspense } from "react"

import { AdminPageBody, AdminPageHero } from "@/components/admin"

import { AdminAuditList, AuditTableSkeleton } from "./components"

export const metadata: Metadata = { title: "Auditoria" }

export default function AdminAuditPage() {
  return (
    <>
      <AdminPageHero
        id="audit-title"
        eyebrow="Auditoria"
        title="Quem fez o quê"
        description="Ações administrativas, das mais recentes para as mais antigas. Horário de Fortaleza."
      />
      <AdminPageBody>
        <Suspense fallback={<AuditTableSkeleton />}>
          <AdminAuditList />
        </Suspense>
      </AdminPageBody>
    </>
  )
}
