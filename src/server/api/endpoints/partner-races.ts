import "server-only"

import { cacheLife, cacheTag } from "next/cache"

import type { PartnerRace } from "@/types/api/partner-race.interface"

import { apiFetch } from "../api-client"
import { type CachedResult, toCachedFailure, unwrapCached } from "./cached-result"

/**
 * `GET /corridas-parceiras` — rota PROPOSTA, ainda pendente no backend (§16 do CLAUDE.md).
 * Enquanto o backend real não tiver a rota, o 404 vira lista vazia.
 */
async function fetchPartnerRaces(): Promise<CachedResult<PartnerRace[]>> {
  "use cache"
  cacheTag("partner-races")
  try {
    const data = await apiFetch<PartnerRace[]>("/corridas-parceiras", { forwardClient: false })
    cacheLife({ stale: 300, revalidate: 300, expire: 900 })
    return { ok: true, data }
  } catch (error) {
    const failure = toCachedFailure(error)
    if (failure.status === 404) {
      cacheLife({ stale: 300, revalidate: 300, expire: 900 })
      return { ok: true, data: [] }
    }
    cacheLife("seconds")
    return failure
  }
}

export async function listPartnerRaces(): Promise<PartnerRace[]> {
  return unwrapCached(await fetchPartnerRaces())
}
