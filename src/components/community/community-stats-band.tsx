import { SectionBand } from "@/components/sections"
import type { CommunityStat } from "@/types/community-stat.interface"

import { CommunityStatItem } from "./community-stat-item"

interface CommunityStatsBandProps {
  stats: CommunityStat[] | null
}

/** Faixa verde com os números da comunidade. Sem números → não renderiza. */
export function CommunityStatsBand({ stats }: CommunityStatsBandProps) {
  if (!stats || stats.length === 0) return null

  return (
    <SectionBand tone="accent" spacing="compact" aria-labelledby="numeros-title">
      <h2 id="numeros-title" className="sr-only">
        Números da comunidade
      </h2>
      <ul className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
        {stats.map((stat) => (
          <CommunityStatItem key={stat.rotulo} stat={stat} />
        ))}
      </ul>
    </SectionBand>
  )
}
