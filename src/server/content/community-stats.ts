import "server-only"

import { env } from "@/lib/env"
import type { CommunityStat } from "@/types/community-stat.interface"

/** Números reais do grupo. Estático até haver endpoint (§16 do CLAUDE.md). */
// TODO(cliente): corridas realizadas, participantes, inscrições e anos de grupo.
const COMMUNITY_STATS: CommunityStat[] | null = null

/** Dados de demonstração para o modo mock. */
const DEMO_COMMUNITY_STATS: CommunityStat[] = [
  { valor: "12+", rotulo: "corridas realizadas" },
  { valor: "3.500+", rotulo: "participantes" },
  { valor: "5.000+", rotulo: "inscrições" },
  { valor: "4", rotulo: "anos de grupo" },
]

/** `null` → a faixa de números não renderiza. */
export function getCommunityStats(): CommunityStat[] | null {
  return env.USE_MOCK_API ? DEMO_COMMUNITY_STATS : COMMUNITY_STATS
}
