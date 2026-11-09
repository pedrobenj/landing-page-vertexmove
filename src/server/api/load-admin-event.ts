import "server-only"

import { unstable_rethrow } from "next/navigation"
import { cache } from "react"

import type { AdminEvent } from "@/types/api/admin-event.interface"

import { isApiError } from "./api-error"
import { getAdminEvent } from "./endpoints/admin-events"

export type AdminEventLoadResult = { event: AdminEvent } | { notFound: true } | { error: true }

/**
 * Corrida do admin para páginas (`/admin/eventos/[id]` e subpáginas). Memoizado por requisição
 * (`cache`): `generateMetadata` e a página fazem um só `GET /admin/eventos/:id`.
 * O redirect do `adminFetch` (sessão expirada) sobe; 404 e falhas viram resultado.
 */
export const loadAdminEvent = cache(async (id: number): Promise<AdminEventLoadResult> => {
  try {
    return { event: await getAdminEvent(id) }
  } catch (error) {
    unstable_rethrow(error)
    if (isApiError(error) && error.status === 404) return { notFound: true }
    console.error("[loadAdminEvent]", error instanceof Error ? error.name : "erro desconhecido")
    return { error: true }
  }
})
