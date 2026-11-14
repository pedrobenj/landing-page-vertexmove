import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { connection } from "next/server"

import { AdminPageBody, AdminPageError, ReadOnlyNotice } from "@/components/admin"
import { canManageEvents } from "@/lib/utils/admin-permissions"
import { toAdminEventFormValues } from "@/lib/utils/admin-event-form-values"
import { parseIdParam } from "@/lib/utils/parse-id-param"
import { loadAdminEvent } from "@/server/api/load-admin-event"
import { requireAdminSession } from "@/server/api/require-admin-session"

import { EventForm } from "../components"

import { AdminEventHeader, EventLifecycleActions, EventSectionNav } from "./components"

/**
 * A página bloqueia (sem <Suspense>) até ler a corrida: assim o `notFound()` roda antes do streaming
 * começar e devolve um 404 de verdade (mesmo padrão de /admin/loja/produtos/[id]).
 */
export const instant = false

const FALLBACK_TITLE = "Editar corrida"

export async function generateMetadata({ params }: PageProps<"/admin/eventos/[id]">): Promise<Metadata> {
  const eventId = parseIdParam((await params).id)
  if (eventId === null) return { title: FALLBACK_TITLE }
  // Mesmo `loadAdminEvent` (memoizado) da página: um só GET por requisição.
  const result = await loadAdminEvent(eventId)
  return { title: "event" in result ? result.event.nome : FALLBACK_TITLE }
}

export default async function AdminEventPage({ params }: PageProps<"/admin/eventos/[id]">) {
  await connection()
  const eventId = parseIdParam((await params).id)
  if (eventId === null) notFound()

  // Autorização aqui, e não só no proxy (pulado em prefetch). Os dois redirects (sem sessão) sobem.
  const [admin, result] = await Promise.all([requireAdminSession(), loadAdminEvent(eventId)])
  if ("notFound" in result) notFound()
  if ("error" in result) {
    return <AdminPageError eyebrow="Corrida" title={FALLBACK_TITLE} message="Não foi possível carregar a corrida" />
  }

  const { event } = result
  const canManage = canManageEvents(admin.papel)

  return (
    <>
      <AdminEventHeader event={event} />
      <AdminPageBody>
        {/* Ciclo de vida no topo do corpo: o vermelho do "Cancelar"/"Excluir" não tem contraste sobre o navy. */}
        {canManage ? <EventLifecycleActions eventId={event.id} status={event.status} /> : <ReadOnlyNotice />}
        <EventSectionNav eventId={event.id} />
        {/* key: depois de salvar/mudar status, o refresh traz dados novos e o form reinicia com eles. */}
        <EventForm key={`${event.id}-${event.slug}`} eventId={event.id} defaultValues={toAdminEventFormValues(event)} readOnly={!canManage} />
      </AdminPageBody>
    </>
  )
}
