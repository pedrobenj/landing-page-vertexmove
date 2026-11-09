import "server-only"

import { cacheLife, cacheTag } from "next/cache"

import type { PartnerRace } from "@/types/api/partner-race.interface"

import { apiFetch } from "../api-client"
import { type CachedResult, PROPOSED_LIST_CACHE_LIFE, proposedRouteFailure, unwrapCached } from "./cached-result"

/**
 * `GET /corridas-parceiras` — rota PROPOSTA, ainda pendente no backend (§16 do CLAUDE.md).
 * Enquanto o backend real não tiver a rota, o 404 vira lista vazia.
 */
async function fetchPartnerRaces(): Promise<CachedResult<PartnerRace[]>> {
  "use cache"
  cacheTag("partner-races")
  try {
    const data = await apiFetch<PartnerRace[]>("/corridas-parceiras", { forwardClient: false })
    cacheLife(PROPOSED_LIST_CACHE_LIFE)
    return { ok: true, data }
  } catch (error) {
    return proposedRouteFailure(error, [])
  }
}

export async function listPartnerRaces(): Promise<PartnerRace[]> {
  return unwrapCached(await fetchPartnerRaces())
}
