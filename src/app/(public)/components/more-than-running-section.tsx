import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { SectionBand, SectionHeading } from "@/components/sections"
import { StaggerGroup } from "@/components/motion"
import { Button } from "@/components/ui/button"

import { ValueBadge } from "./value-badge"
import { VALUE_BADGES } from "./value-badges"

// TODO(cliente): texto institucional do Vertex.
export function MoreThanRunningSection() {
  return (
    <SectionBand tone="dark" aria-labelledby="mais-que-corrida-title">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col items-start gap-6">
          <SectionHeading
            id="mais-que-corrida-title"
            tone="dark"
            eyebrow="Mais que corrida"
            title="Quem corre junto vai mais longe"
            description="O Vertex reúne corredores de todos os ritmos em provas de rua seguras, bem organizadas e cheias de energia, em Fortaleza."
          />
          <Button asChild variant="cta" size="xl" className="w-full normal-case tracking-normal sm:w-auto">
            <Link href="/sobre">
              Conheça o Vertex
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
        <StaggerGroup as="ul" className="grid grid-cols-2">
          {VALUE_BADGES.map((badge) => (
            <ValueBadge key={badge.label} badge={badge} />
          ))}
        </StaggerGroup>
      </div>
    </SectionBand>
  )
}
