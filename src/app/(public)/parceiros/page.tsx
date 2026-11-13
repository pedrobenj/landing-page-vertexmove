import { Handshake } from "lucide-react"
import type { Metadata } from "next"

import { EmptyState } from "@/components/feedback"
import { PageHero, SectionBand } from "@/components/sections"
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
    <>
      <PageHero
        id="parceiros-page-title"
        eyebrow="Quem sobe junto"
        title="Parceiros"
        description="Cada prova do Vertex tem marcas que ajudam a construir a subida. Obrigado por estarem na largada com a gente."
        actions={hasPartners ? <BecomePartnerButton /> : undefined}
      />
      <SectionBand className="border-t-0">
        {hasPartners ? (
          <PartnerGrid partners={partners} />
        ) : (
          <EmptyState
            icon={Handshake}
            title="Em breve, nossos parceiros aparecerão aqui."
            description="Quer apoiar o esporte em Fortaleza e subir junto com a gente?"
            action={<BecomePartnerButton />}
          />
        )}
      </SectionBand>
    </>
  )
}
