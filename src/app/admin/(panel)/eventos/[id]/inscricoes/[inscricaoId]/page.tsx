import type { Metadata } from "next"
import { notFound, unstable_rethrow } from "next/navigation"
import { connection } from "next/server"

import { AdminBackLink, AdminPageBody, AdminPageHero, RegistrationStatusBadge } from "@/components/admin"
import { ServerError } from "@/components/feedback"
import { canManageEvents } from "@/lib/utils/admin-permissions"
import { parseIdParam } from "@/lib/utils/parse-id-param"
import { isApiError } from "@/server/api/api-error"
import { getAdminRegistration } from "@/server/api/endpoints/admin-registrations"
import { requireAdminSession } from "@/server/api/require-admin-session"
import type { ApiAdminRegistrationDetails } from "@/types/api/admin-registration.interface"

import { RegistrationActions, RegistrationDetails } from "./components"

/** Bloqueia (sem <Suspense>) até ler a inscrição: o `notFound()` roda antes do streaming e devolve 404 de verdade. */
export const instant = false

export const metadata: Metadata = { title: "Inscrição" }

export default async function AdminRegistrationPage({ params }: PageProps<"/admin/eventos/[id]/inscricoes/[inscricaoId]">) {
  await connection()
  // Autorização aqui, e não só no proxy (pulado em prefetch). Fora do try/catch: o redirect sobe.
  const admin = await requireAdminSession()
  const { id, inscricaoId } = await params
  const eventId = parseIdParam(id)
  const registrationId = parseIdParam(inscricaoId)
  if (eventId === null || registrationId === null) notFound()
  const backLink = <AdminBackLink href={`/admin/eventos/${eventId}/inscricoes`}>Inscrições</AdminBackLink>

  let registration: ApiAdminRegistrationDetails
  try {
    registration = await getAdminRegistration(registrationId)
  } catch (error) {
    unstable_rethrow(error)
    if (isApiError(error) && error.status === 404) notFound()
    console.error("[AdminRegistrationPage]", error instanceof Error ? error.name : "erro desconhecido")
    return (
      <>
        <AdminPageHero id="admin-registration-title" eyebrow="Inscrição" title="Inscrição" before={backLink} />
        <AdminPageBody>
          <ServerError title="Não foi possível carregar a inscrição" />
        </AdminPageBody>
      </>
    )
  }
  // Inscrição de outra corrida pela URL: mesma resposta de inexistente.
  if (registration.evento.id !== eventId) notFound()

  return (
    <>
      <AdminPageHero
        id="admin-registration-title"
        eyebrow={registration.evento.nome}
        title={registration.codigo}
        description={registration.nomeCompleto}
        before={backLink}
        badge={<RegistrationStatusBadge status={registration.status} />}
      />
      <AdminPageBody>
        <RegistrationDetails registration={registration} />
        {canManageEvents(admin.papel) && <RegistrationActions registration={registration} />}
      </AdminPageBody>
    </>
  )
}
