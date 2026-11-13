import type { Metadata } from "next"
import { Suspense } from "react"

import { PartnerRaceGridSkeleton } from "@/components/partner-races"
import { SectionBand, SectionHeading } from "@/components/sections"

import { PartnerRaceList } from "./components"

export const metadata: Metadata = {
  title: "Provas parceiras",
  description: "Corridas de outras organizações com cupom de desconto exclusivo para a comunidade Vertex.",
  alternates: { canonical: "/corridas-parceiras" },
}

export default function PartnerRacesPage() {
  return (
    <SectionBand aria-labelledby="corridas-parceiras-title" className="border-t-0">
      <SectionHeading
        as="h1"
        id="corridas-parceiras-title"
        eyebrow="Provas parceiras"
        title="Outras trilhas"
        description="Provas de outras organizações com cupom do Vertex. Copie o código e use na inscrição, direto no site da prova."
      />
      <h2 className="sr-only">Corridas com cupom exclusivo</h2>
      <Suspense fallback={<PartnerRaceGridSkeleton />}>
        <PartnerRaceList />
      </Suspense>
    </SectionBand>
  )
}
