import { Hourglass } from "lucide-react"
import type { Metadata } from "next"
import { connection } from "next/server"

import { AdminEventSubpageHeader } from "@/components/admin"
import { EmptyState, ServerError } from "@/components/feedback"
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
    return (
      <section className="flex flex-col gap-6">
        <h1 className="text-2xl font-extrabold text-brand-navy">{TITLE}</h1>
        <ServerError title="Não foi possível carregar a corrida" />
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-6">
      <AdminEventSubpageHeader event={data.event} title={TITLE} />
      <EmptyState
        icon={Hourglass}
        title="Em breve: aguardando endpoint do backend."
        description="Aqui vão ficar a lista de inscritos, a exportação em CSV e a retirada de kit."
      />
    </section>
  )
}
