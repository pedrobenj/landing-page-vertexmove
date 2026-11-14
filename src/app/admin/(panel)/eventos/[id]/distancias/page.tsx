import type { Metadata } from "next"
import { connection } from "next/server"
import { Suspense } from "react"

import { AdminEventSubpageHeader, AdminPageBody, AdminPageError, ReadOnlyNotice } from "@/components/admin"
import { canManageEvents } from "@/lib/utils/admin-permissions"
import { getAdminEventPageTitle, loadAdminEventPage } from "@/server/api/load-admin-event-page"

import { DistanceList, DistanceListSkeleton } from "./components"

/** Bloqueante até ler a corrida: 404 real para id inválido ou inexistente. */
export const instant = false

const TITLE = "Distâncias e lotes"

export async function generateMetadata({ params }: PageProps<"/admin/eventos/[id]/distancias">): Promise<Metadata> {
  return { title: await getAdminEventPageTitle((await params).id, TITLE) }
}

export default async function AdminDistancesPage({ params }: PageProps<"/admin/eventos/[id]/distancias">) {
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
        description="Cada distância tem suas vagas e seus lotes de preço. O lote vigente é decidido pelo sistema."
      />
      <AdminPageBody>
        {!canManage && <ReadOnlyNotice />}
        <Suspense fallback={<DistanceListSkeleton />}>
          <DistanceList eventId={event.id} canManage={canManage} />
        </Suspense>
      </AdminPageBody>
    </>
  )
}
