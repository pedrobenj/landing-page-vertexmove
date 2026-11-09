import type { Metadata } from "next"
import { notFound, unstable_rethrow } from "next/navigation"
import { connection } from "next/server"

import { ServerError } from "@/components/feedback"
import { canManageEvents } from "@/lib/utils/admin-permissions"
import { toAdminEventFormValues } from "@/lib/utils/admin-event-form-values"
import { parseIdParam } from "@/lib/utils/parse-id-param"
import { isApiError } from "@/server/api/api-error"
import { getAdminEvent } from "@/server/api/endpoints/admin-events"
import { requireAdminSession } from "@/server/api/require-admin-session"
import type { AdminEvent } from "@/types/api/admin-event.interface"

import { EventForm } from "../components"

import { AdminEventHeader, EventLifecycleActions, EventSectionNav } from "./components"

/**
 * A página bloqueia (sem <Suspense>) até ler a corrida: assim o `notFound()` roda antes do streaming
 * começar e devolve um 404 de verdade (mesmo padrão de /admin/loja/produtos/[id]).
 */
export const instant = false

export const metadata: Metadata = { title: "Editar corrida" }

type LoadResult = { event: AdminEvent } | { notFound: true } | { error: true }

async function loadEvent(id: number): Promise<LoadResult> {
  try {
    return { event: await getAdminEvent(id) }
  } catch (error) {
    // Redirect do adminFetch (sessão expirada) sobe.
    unstable_rethrow(error)
    if (isApiError(error) && error.status === 404) return { notFound: true }
    console.error("[AdminEventPage]", error instanceof Error ? error.name : "erro desconhecido")
    return { error: true }
  }
}

export default async function AdminEventPage({ params }: PageProps<"/admin/eventos/[id]">) {
  await connection()
  // Autorização aqui, e não só no proxy (pulado em prefetch). Fora do try/catch: o redirect sobe.
  const admin = await requireAdminSession()
  const eventId = parseIdParam((await params).id)
  if (eventId === null) notFound()

  const result = await loadEvent(eventId)
  if ("notFound" in result) notFound()
  if ("error" in result) {
    return (
      <section className="flex flex-col gap-6">
        <h1 className="text-2xl font-extrabold text-brand-navy">Editar corrida</h1>
        <ServerError title="Não foi possível carregar a corrida" />
      </section>
    )
  }

  const { event } = result
  const canManage = canManageEvents(admin.papel)

  return (
    <section className="flex flex-col gap-8">
      <AdminEventHeader event={event} />
      {canManage ? (
        <EventLifecycleActions eventId={event.id} status={event.status} />
      ) : (
        <p className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">
          Seu perfil tem acesso somente leitura às corridas.
        </p>
      )}
      <EventSectionNav eventId={event.id} />
      {/* key: depois de salvar/mudar status, o refresh traz dados novos e o form reinicia com eles. */}
      <EventForm key={`${event.id}-${event.slug}`} eventId={event.id} defaultValues={toAdminEventFormValues(event)} readOnly={!canManage} />
    </section>
  )
}
