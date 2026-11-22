import type { Metadata } from "next"
import { notFound, unstable_rethrow } from "next/navigation"
import { connection } from "next/server"

import { AdminPageBody, AdminPageHero } from "@/components/admin"
import { ServerError } from "@/components/feedback"
import { canManageEvents } from "@/lib/utils/admin-permissions"
import { parseIdParam } from "@/lib/utils/parse-id-param"
import { isApiError } from "@/server/api/api-error"
import { getAdminPartnerRace } from "@/server/api/endpoints/admin-partner-races"
import { requireAdminSession } from "@/server/api/require-admin-session"
import type { AdminPartnerRace } from "@/types/api/partner-race.interface"

import { EditPartnerRace } from "./components"

/** Bloqueia (sem <Suspense>) até ler a corrida: o `notFound()` roda antes do streaming e devolve 404 de verdade. */
export const instant = false

export const metadata: Metadata = { title: "Editar corrida parceira" }

export default async function EditPartnerRacePage({ params }: PageProps<"/admin/corridas-parceiras/[id]">) {
  await connection()
  // Autorização aqui, e não só no proxy (pulado em prefetch). Fora do try/catch: o redirect sobe.
  const admin = await requireAdminSession()
  const id = parseIdParam((await params).id)
  if (id === null) notFound()

  let race: AdminPartnerRace
  try {
    race = await getAdminPartnerRace(id)
  } catch (error) {
    unstable_rethrow(error)
    if (isApiError(error) && error.status === 404) notFound()
    console.error("[EditPartnerRacePage]", error instanceof Error ? error.name : "erro desconhecido")
    return (
      <>
        <AdminPageHero id="edit-partner-race-title" eyebrow="Outras trilhas" title="Editar corrida parceira" />
        <AdminPageBody>
          <ServerError title="Não foi possível carregar a corrida parceira" />
        </AdminPageBody>
      </>
    )
  }

  return <EditPartnerRace race={race} canManage={canManageEvents(admin.papel)} />
}
