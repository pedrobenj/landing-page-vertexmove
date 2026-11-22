import type { Metadata } from "next"
import { connection } from "next/server"
import { Suspense } from "react"

import { AdminEventSubpageHeader, AdminPageBody, AdminPageError, ReadOnlyNotice } from "@/components/admin"
import { canManageEvents } from "@/lib/utils/admin-permissions"
import { getAdminEventPageTitle, loadAdminEventPage } from "@/server/api/load-admin-event-page"

import { AdminRegistrationsList, ExportRegistrationsLink, RegistrationsListSkeleton } from "./components"

/** Bloqueante até ler a corrida: 404 real para id inválido ou inexistente. */
export const instant = false

const TITLE = "Inscrições"

export async function generateMetadata({ params }: PageProps<"/admin/eventos/[id]/inscricoes">): Promise<Metadata> {
  return { title: await getAdminEventPageTitle((await params).id, TITLE) }
}

/** Inscritos da corrida: filtros, retirada de kit e exportação em CSV para a entrega de kits. */
export default async function AdminRegistrationsPage({ params }: PageProps<"/admin/eventos/[id]/inscricoes">) {
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
        description="Acompanhe os inscritos, registre a retirada de kit e exporte a lista."
        action={<ExportRegistrationsLink eventId={event.id} />}
      />
      <AdminPageBody>
        {!canManage && <ReadOnlyNotice />}
        <Suspense fallback={<RegistrationsListSkeleton />}>
          <AdminRegistrationsList eventId={event.id} canManage={canManage} />
        </Suspense>
      </AdminPageBody>
    </>
  )
}
