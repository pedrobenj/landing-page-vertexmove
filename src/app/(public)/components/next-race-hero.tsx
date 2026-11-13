import { isApiError } from "@/server/api/api-error"
import { listPublicEvents } from "@/server/api/endpoints/events"
import { getNextEvent } from "@/lib/utils"

import { HeroFrame } from "./hero-frame"
import { InstitutionalHeroContent } from "./institutional-hero-content"
import { NextRaceHeroContent } from "./next-race-hero-content"

/**
 * Hero da home. Usa a mesma lista de `GET /eventos` da grade (cache compartilhado, sem chamada nova).
 * Sem corrida aberta ou com a API fora, cai no hero institucional: o topo da página nunca mostra erro.
 */
export async function NextRaceHero() {
  let next = null
  try {
    next = getNextEvent((await listPublicEvents()).items)
  } catch (error) {
    if (!isApiError(error)) throw error
  }

  return <HeroFrame>{next ? <NextRaceHeroContent event={next} /> : <InstitutionalHeroContent />}</HeroFrame>
}
