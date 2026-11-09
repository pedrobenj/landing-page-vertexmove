import type { Metadata } from "next"
import { Suspense } from "react"

import { AdminAuditList, AuditTableSkeleton } from "./components"

export const metadata: Metadata = { title: "Auditoria" }

export default function AdminAuditPage() {
  return (
    <section aria-labelledby="audit-title" className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 id="audit-title" className="text-2xl font-extrabold text-brand-navy">
          Auditoria
        </h1>
        <p className="text-sm text-muted-foreground">Ações administrativas, das mais recentes para as mais antigas. Horário de Fortaleza.</p>
      </div>
      <Suspense fallback={<AuditTableSkeleton />}>
        <AdminAuditList />
      </Suspense>
    </section>
  )
}
