import "server-only"

import { cacheLife, cacheTag } from "next/cache"

import type { PartnerRace } from "@/types/api/partner-race.interface"

import { apiFetch } from "../api-client"
import { type CachedResult, SLOW_LIST_CACHE_LIFE, toCachedFailure, unwrapCached } from "./cached-result"

/** Tag invalidada pelas actions do admin de corridas parceiras. */
export const PARTNER_RACES_TAG = "partner-races"

/** `GET /corridas-parceiras`: ativas de hoje em diante, na ordem definida no admin (array, até 100). */
async function fetchPartnerRaces(): Promise<CachedResult<PartnerRace[]>> {
  "use cache"
  cacheTag(PARTNER_RACES_TAG)
  try {
    const data = await apiFetch<PartnerRace[]>("/corridas-parceiras", { forwardClient: false })
    cacheLife(SLOW_LIST_CACHE_LIFE)
    return { ok: true, data }
  } catch (error) {
    cacheLife("seconds")
    return toCachedFailure(error)
  }
}

/** Corridas parceiras do site (home e `/corridas-parceiras`). Lança `ApiError`. */
export async function listPartnerRaces(): Promise<PartnerRace[]> {
  return unwrapCached(await fetchPartnerRaces())
}
