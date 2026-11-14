import { Hourglass } from "lucide-react"
import type { Metadata } from "next"
import { connection } from "next/server"

import { AdminEventSubpageHeader, AdminPageBody, AdminPageError } from "@/components/admin"
import { EmptyState } from "@/components/feedback"
import { getAdminEventPageTitle, loadAdminEventPage } from "@/server/api/load-admin-event-page"

/** Bloqueante até ler a corrida: 404 real para id inválido ou inexistente. */
export const instant = false

const TITLE = "Inscrições"

export async function generateMetadata({ params }: PageProps<"/admin/eventos/[id]/inscricoes">): Promise<Metadata> {
  return { title: await getAdminEventPageTitle((await params).id, TITLE) }
}

/** Lista, exportação CSV e retirada de kit dependem de endpoints do backend (§15). */
export default async function AdminRegistrationsPage({ params }: PageProps<"/admin/eventos/[id]/inscricoes">) {
  await connection()
  const data = await loadAdminEventPage((await params).id)
  if ("error" in data) {
    return <AdminPageError eyebrow="Corrida" title={TITLE} message="Não foi possível carregar a corrida" />
  }

  return (
    <>
      <AdminEventSubpageHeader event={data.event} title={TITLE} />
      <AdminPageBody>
        <EmptyState
          icon={Hourglass}
          title="Em breve: aguardando endpoint do backend."
          description="Aqui vão ficar a lista de inscritos, a exportação em CSV e a retirada de kit."
        />
      </AdminPageBody>
    </>
  )
}
