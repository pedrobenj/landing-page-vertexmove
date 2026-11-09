import type { Metadata } from "next"
import { connection } from "next/server"
import { Suspense } from "react"

import { AdminEventSubpageHeader, ReadOnlyNotice } from "@/components/admin"
import { ServerError } from "@/components/feedback"
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
    return (
      <section className="flex flex-col gap-6">
        <h1 className="text-2xl font-extrabold text-brand-navy">{TITLE}</h1>
        <ServerError title="Não foi possível carregar a corrida" />
      </section>
    )
  }

  const { admin, event } = data
  const canManage = canManageEvents(admin.papel)

  return (
    <section className="flex flex-col gap-6">
      <AdminEventSubpageHeader
        event={event}
        title={TITLE}
        description="Cada distância tem suas vagas e seus lotes de preço. O lote vigente é decidido pelo sistema."
      />
      {!canManage && <ReadOnlyNotice />}
      <Suspense fallback={<DistanceListSkeleton />}>
        <DistanceList eventId={event.id} canManage={canManage} />
      </Suspense>
    </section>
  )
}
