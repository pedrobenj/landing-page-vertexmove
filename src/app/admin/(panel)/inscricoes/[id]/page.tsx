import type { Metadata } from "next"
import { notFound, redirect, unstable_rethrow } from "next/navigation"
import { connection } from "next/server"

import { AdminPageBody, AdminPageHero } from "@/components/admin"
import { ServerError } from "@/components/feedback"
import { parseIdParam } from "@/lib/utils/parse-id-param"
import { isApiError } from "@/server/api/api-error"
import { getAdminRegistration } from "@/server/api/endpoints/admin-registrations"
import { requireAdminSession } from "@/server/api/require-admin-session"

/** Bloqueante: o 404 e o redirect acontecem antes do streaming. */
export const instant = false

export const metadata: Metadata = { title: "Inscrição" }

/**
 * Atalho por id (a fila de pagamentos só conhece a inscrição, não a corrida): lê a inscrição e redireciona
 * para o detalhe dentro da corrida.
 */
export default async function AdminRegistrationShortcutPage({ params }: PageProps<"/admin/inscricoes/[id]">) {
  await connection()
  await requireAdminSession()
  const registrationId = parseIdParam((await params).id)
  if (registrationId === null) notFound()

  let eventId: number
  try {
    eventId = (await getAdminRegistration(registrationId)).evento.id
  } catch (error) {
    unstable_rethrow(error)
    if (isApiError(error) && error.status === 404) notFound()
    console.error("[AdminRegistrationShortcutPage]", error instanceof Error ? error.name : "erro desconhecido")
    return (
      <>
        <AdminPageHero id="admin-registration-title" eyebrow="Inscrição" title="Inscrição" />
        <AdminPageBody>
          <ServerError title="Não foi possível carregar a inscrição" />
        </AdminPageBody>
      </>
    )
  }
  redirect(`/admin/eventos/${eventId}/inscricoes/${registrationId}`)
}
