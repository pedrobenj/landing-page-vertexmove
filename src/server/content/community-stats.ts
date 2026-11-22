import "server-only"

import { env } from "@/lib/env"
import type { CommunityStat } from "@/types/community-stat.interface"

/** Números reais do grupo. Estático até haver endpoint (§16 do CLAUDE.md). */
// TODO(cliente): participantes e inscrições, quando houver números (o cliente ainda não tem os exatos).
const COMMUNITY_STATS: CommunityStat[] | null = [
  { valor: "1+", rotulo: "ano de grupo" },
  { valor: "5+", rotulo: "eventos realizados" },
]

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
