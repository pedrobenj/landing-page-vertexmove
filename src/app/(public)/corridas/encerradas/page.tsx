import { ArrowRight } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"

import { SectionBand, SectionHeading } from "@/components/sections"
import { Button } from "@/components/ui/button"

import { PastEventGridSkeleton, PastEventList } from "./components"

export const metadata: Metadata = {
  title: "Corridas encerradas",
  description: "Edições passadas das corridas do Vertex Grupo de Corrida em Fortaleza.",
  alternates: { canonical: "/corridas/encerradas" },
}

export default function PastEventsPage() {
  return (
    <SectionBand aria-labelledby="encerradas-title" className="border-t-0">
      <SectionHeading
        as="h1"
        id="encerradas-title"
        eyebrow="Nossa história em movimento"
        title="Corridas que já vivemos"
        description="Edições que viraram histórias, conquistas e amizades."
        actions={
          <Button asChild variant="outline" size="xl" className="w-full shadow-sm sm:w-auto">
            <Link href="/#corridas">
              Ver próximas corridas
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        }
      />
      <h2 className="sr-only">Edições passadas</h2>
      <Suspense fallback={<PastEventGridSkeleton />}>
        <PastEventList />
      </Suspense>
    </SectionBand>
  )
}
