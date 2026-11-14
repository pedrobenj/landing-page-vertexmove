import { Lock } from "lucide-react"
import type { Metadata } from "next"
import { connection } from "next/server"
import { Suspense } from "react"

import { AdminEventSubpageHeader, AdminPageBody, AdminPageError, ReadOnlyNotice } from "@/components/admin"
import { canManageEvents } from "@/lib/utils/admin-permissions"
import { getAdminEventPageTitle, loadAdminEventPage } from "@/server/api/load-admin-event-page"

import { DocumentList, DocumentListSkeleton } from "./components"

/** Bloqueante até ler a corrida: 404 real para id inválido ou inexistente. */
export const instant = false

const TITLE = "Documentos"

export async function generateMetadata({ params }: PageProps<"/admin/eventos/[id]/documentos">): Promise<Metadata> {
  return { title: await getAdminEventPageTitle((await params).id, TITLE) }
}

export default async function AdminDocumentsPage({ params }: PageProps<"/admin/eventos/[id]/documentos">) {
  await connection()
  const data = await loadAdminEventPage((await params).id)
  if ("error" in data) {
    return <AdminPageError eyebrow="Corrida" title={TITLE} message="Não foi possível carregar a corrida" />
  }

  const { admin, event } = data
  const canManage = canManageEvents(admin.papel)

  return (
    <>
      <AdminEventSubpageHeader
        event={event}
        title={TITLE}
        description="Regulamento e termo de responsabilidade que o atleta aceita na inscrição."
      />
      <AdminPageBody>
        <p role="note" className="flex items-start gap-2 rounded-xl border border-brand-navy/20 bg-brand-navy/5 p-4 text-sm text-brand-navy">
          <Lock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Documentos são imutáveis; publique uma nova versão.
        </p>
        {!canManage && <ReadOnlyNotice />}
        <Suspense fallback={<DocumentListSkeleton />}>
          <DocumentList eventId={event.id} canManage={canManage} />
        </Suspense>
      </AdminPageBody>
    </>
  )
}
