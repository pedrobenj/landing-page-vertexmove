import { Handshake } from "lucide-react"
import type { Metadata } from "next"

import { EmptyState } from "@/components/feedback"
import { SectionBand, SectionHeading } from "@/components/sections"
import { getPartners } from "@/server/content/partners"

import { BecomePartnerButton, PartnerGrid } from "./components"

export const metadata: Metadata = {
  title: "Parceiros",
  description: "Marcas e apoiadores que correm junto com o Vertex Grupo de Corrida.",
  alternates: { canonical: "/parceiros" },
}

/** Lista estática até haver endpoint (CLAUDE.md §16). */
export default function PartnersPage() {
  const partners = getPartners()
  const hasPartners = partners.length > 0

  return (
    <SectionBand aria-labelledby="parceiros-page-title" className="border-t-0">
      <SectionHeading
        as="h1"
        id="parceiros-page-title"
        eyebrow="Marcas que correm com a gente"
        title="Parceiros"
        description="Quem apoia o Vertex ajuda a tornar cada prova possível. Obrigado por correrem com a gente!"
        actions={hasPartners ? <BecomePartnerButton /> : undefined}
      />
      {hasPartners ? (
        <PartnerGrid partners={partners} />
      ) : (
        <EmptyState
          icon={Handshake}
          title="Em breve, nossos parceiros aparecerão aqui."
          description="Quer apoiar o esporte em Fortaleza e fazer parte dessa comunidade?"
          action={<BecomePartnerButton />}
        />
      )}
    </SectionBand>
  )
}
