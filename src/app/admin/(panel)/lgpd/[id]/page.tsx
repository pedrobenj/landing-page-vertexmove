import type { Metadata } from "next"
import { notFound, unstable_rethrow } from "next/navigation"
import { connection } from "next/server"

import { AdminBackLink, AdminPageBody, AdminPageHero, LgpdStatusBadge } from "@/components/admin"
import { ServerError } from "@/components/feedback"
import { getLgpdRequestTypeLabel } from "@/lib/utils/lgpd-labels"
import { parseIdParam } from "@/lib/utils/parse-id-param"
import { isApiError } from "@/server/api/api-error"
import { getAdminLgpdRequest } from "@/server/api/endpoints/admin-lgpd"
import { requireAdminSession } from "@/server/api/require-admin-session"
import type { AdminLgpdRequest } from "@/types/api/lgpd-request.interface"

import { LgpdHolderActions, LgpdRequestDetails, LgpdStatusForm } from "./components"

/** Bloqueia (sem <Suspense>) até ler a solicitação: o `notFound()` roda antes do streaming e devolve 404 de verdade. */
export const instant = false

export const metadata: Metadata = { title: "Solicitação LGPD" }

export default async function AdminLgpdRequestPage({ params }: PageProps<"/admin/lgpd/[id]">) {
  await connection()
  // Autorização aqui, e não só no proxy (pulado em prefetch). Fora do try/catch: o redirect sobe.
  await requireAdminSession()
  const id = parseIdParam((await params).id)
  if (id === null) notFound()
  const backLink = <AdminBackLink href="/admin/lgpd">Solicitações LGPD</AdminBackLink>

  let request: AdminLgpdRequest
  try {
    request = await getAdminLgpdRequest(id)
  } catch (error) {
    unstable_rethrow(error)
    if (isApiError(error) && error.status === 404) notFound()
    console.error("[AdminLgpdRequestPage]", error instanceof Error ? error.name : "erro desconhecido")
    return (
      <>
        <AdminPageHero id="admin-lgpd-request-title" eyebrow="LGPD" title="Solicitação" before={backLink} />
        <AdminPageBody>
          <ServerError title="Não foi possível carregar a solicitação" />
        </AdminPageBody>
      </>
    )
  }

  return (
    <>
      <AdminPageHero
        id="admin-lgpd-request-title"
        eyebrow={getLgpdRequestTypeLabel(request.tipo)}
        title={request.protocolo}
        description={request.nomeCompleto}
        before={backLink}
        badge={<LgpdStatusBadge status={request.status} />}
      />
      <AdminPageBody>
        <LgpdRequestDetails request={request} />
        <div className="grid gap-6 lg:grid-cols-2">
          <LgpdStatusForm request={request} />
          <LgpdHolderActions request={request} />
        </div>
      </AdminPageBody>
    </>
  )
}
