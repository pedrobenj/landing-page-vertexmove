import "server-only"

import { unstable_rethrow } from "next/navigation"

import { type EventReadiness, getEventReadiness } from "@/lib/utils/get-event-readiness"

import { listDistances } from "./endpoints/distances"
import { listDocuments } from "./endpoints/documents"
import { listPriceTiers } from "./endpoints/price-tiers"

export type EventReadinessResult = { readiness: EventReadiness } | { error: true }

/**
 * Checklist de uma corrida para o dashboard: distâncias, lotes das ativas e documentos. Uma falha
 * vira `{ error }` só desta corrida; o redirect do `adminFetch` (sessão expirada) sobe.
 */
export async function loadEventReadiness(eventId: number, now: Date): Promise<EventReadinessResult> {
  try {
    const [distances, documents] = await Promise.all([listDistances(eventId), listDocuments(eventId)])
    const withTiers = await Promise.all(
      distances.map(async (distance) => ({
        ativo: distance.ativo,
        lotes: distance.ativo ? await listPriceTiers(distance.id) : [],
      })),
    )
    return { readiness: getEventReadiness({ distances: withTiers, documents }, now) }
  } catch (error) {
    unstable_rethrow(error)
    console.error("[loadEventReadiness]", error instanceof Error ? error.name : "erro desconhecido")
    return { error: true }
  }
}
