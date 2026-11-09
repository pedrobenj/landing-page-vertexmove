import type { Metadata } from "next"
import { connection } from "next/server"
import { Suspense } from "react"

import { AdminEventSubpageHeader, ReadOnlyNotice } from "@/components/admin"
import { ServerError } from "@/components/feedback"
import { canManageEvents } from "@/lib/utils/admin-permissions"
import { getAdminEventPageTitle, loadAdminEventPage } from "@/server/api/load-admin-event-page"

import { KitList, KitListSkeleton } from "./components"

/** Bloqueante até ler a corrida: 404 real para id inválido ou inexistente. */
export const instant = false

const TITLE = "Kits"

export async function generateMetadata({ params }: PageProps<"/admin/eventos/[id]/kits">): Promise<Metadata> {
  return { title: await getAdminEventPageTitle((await params).id, TITLE) }
}

export default async function AdminKitsPage({ params }: PageProps<"/admin/eventos/[id]/kits">) {
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
        description="Kits que o atleta pode escolher na inscrição, com as fotos exibidas no site."
      />
      {!canManage && <ReadOnlyNotice />}
      <Suspense fallback={<KitListSkeleton />}>
        <KitList eventId={event.id} canManage={canManage} />
      </Suspense>
    </section>
  )
}
