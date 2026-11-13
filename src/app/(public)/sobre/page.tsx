import { ArrowRight } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { CommunityStatsBand } from "@/components/community"
import { SectionBand, SectionHeading } from "@/components/sections"
import { Button } from "@/components/ui/button"
import { SITE_TAGLINE } from "@/lib/utils"
import { getCommunityStats } from "@/server/content/community-stats"

import { AboutSections } from "./components"

export const metadata: Metadata = {
  title: "O Vertex",
  description: "Conheça o Vertex Grupo de Corrida: comunidade de corredores de Fortaleza que organiza corridas de rua abertas a todos.",
  alternates: { canonical: "/sobre" },
}

// TODO(cliente): fotos reais do grupo (treinos e provas) para ilustrar a história.
export default function AboutPage() {
  return (
    <>
      <SectionBand aria-labelledby="sobre-title" className="border-t-0">
        <SectionHeading
          as="h1"
          id="sobre-title"
          eyebrow="Vertex Grupo de Corrida"
          title="O Vertex"
          description={`${SITE_TAGLINE} Corridas de rua em Fortaleza para quem quer subir mais um, no próprio ritmo.`}
          actions={
            <Button asChild variant="cta" size="xl" className="w-full normal-case tracking-normal sm:w-auto">
              <Link href="/#corridas">
                Ver os próximos topos
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          }
        />
      </SectionBand>
      <AboutSections />
      <CommunityStatsBand stats={getCommunityStats()} />
    </>
  )
}
