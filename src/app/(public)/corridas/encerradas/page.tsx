import { ArrowRight } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"

import { PageHero, SectionBand } from "@/components/sections"
import { Button } from "@/components/ui/button"

import { PastEventGridSkeleton, PastEventList } from "./components"

export const metadata: Metadata = {
  title: "Topos conquistados",
  description: "Edições passadas das corridas do Vertex Grupo de Corrida em Fortaleza.",
  alternates: { canonical: "/corridas/encerradas" },
}

export default function PastEventsPage() {
  return (
    <>
      <PageHero
        id="encerradas-title"
        eyebrow="Edições passadas"
        title="Topos conquistados"
        description="Cada edição foi um degrau. Relembre as provas que já subimos juntos."
        actions={
          <Button asChild variant="cta" size="xl" className="w-full normal-case tracking-normal sm:w-auto">
            <Link href="/#corridas">
              Ver os próximos topos
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        }
      />
      <SectionBand className="border-t-0">
        <h2 className="sr-only">Edições passadas</h2>
        <Suspense fallback={<PastEventGridSkeleton />}>
          <PastEventList />
        </Suspense>
      </SectionBand>
    </>
  )
}
