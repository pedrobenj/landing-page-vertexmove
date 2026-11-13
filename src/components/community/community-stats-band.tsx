import { SectionBand } from "@/components/sections"
import { StaggerGroup } from "@/components/motion"
import type { CommunityStat } from "@/types/community-stat.interface"

import { CommunityStatItem } from "./community-stat-item"

interface CommunityStatsBandProps {
  stats: CommunityStat[] | null
}

/** Faixa navy com os números da comunidade (página "O Vertex"). Sem números → não renderiza. */
export function CommunityStatsBand({ stats }: CommunityStatsBandProps) {
  if (!stats || stats.length === 0) return null

  return (
    <SectionBand tone="dark" spacing="compact" aria-labelledby="numeros-title">
      <h2 id="numeros-title" className="sr-only">
        Números da comunidade
      </h2>
      <StaggerGroup as="ul" className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
        {stats.map((stat) => (
          <CommunityStatItem key={stat.rotulo} stat={stat} tone="dark" />
        ))}
      </StaggerGroup>
    </SectionBand>
  )
}
