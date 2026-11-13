import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { CommunityStatItem } from "@/components/community"
import { StaggerGroup } from "@/components/motion"
import { SectionBand, SectionHeading } from "@/components/sections"
import { Button } from "@/components/ui/button"
import { getCommunityStats } from "@/server/content/community-stats"

import { ValueBadge } from "./value-badge"
import { VALUE_BADGES } from "./value-badges"

// TODO(cliente): texto institucional do Vertex.
/** Números + selos num só bloco navy (sem números definidos, ficam só os selos). */
export function CommunitySection() {
  const stats = getCommunityStats()

  return (
    <SectionBand tone="dark" aria-labelledby="comunidade-title">
      <SectionHeading
        id="comunidade-title"
        tone="dark"
        eyebrow="Comunidade"
        title="Quem sobe junto"
        description="Corredores de todos os ritmos dividindo a mesma largada em Fortaleza. Ninguém chega ao topo sozinho."
        actions={
          <Button asChild variant="cta" size="xl" className="w-full normal-case tracking-normal sm:w-auto">
            <Link href="/sobre">
              Conheça o Vertex
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        }
      />
      {stats && stats.length > 0 && (
        <StaggerGroup as="ul" aria-label="Números da comunidade" className="grid grid-cols-2 gap-x-6 gap-y-8 border-y border-white/10 py-10 lg:grid-cols-4">
          {stats.map((stat) => (
            <CommunityStatItem key={stat.rotulo} stat={stat} tone="dark" />
          ))}
        </StaggerGroup>
      )}
      <StaggerGroup as="ul" aria-label="O que você encontra no Vertex" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {VALUE_BADGES.map((badge) => (
          <ValueBadge key={badge.label} badge={badge} />
        ))}
      </StaggerGroup>
    </SectionBand>
  )
}
