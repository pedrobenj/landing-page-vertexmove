import type { Metadata } from "next"

import { PageHero, SectionBand } from "@/components/sections"

import { ContactChannelList, TrainingInfo } from "./components"

export const metadata: Metadata = {
  title: "Fale com a gente",
  description: "Fale com o Vertex Grupo de Corrida pelo WhatsApp, Instagram ou e-mail.",
  alternates: { canonical: "/contato" },
}

export default function ContactPage() {
  return (
    <>
      <PageHero
        id="contato-title"
        eyebrow="Contato"
        title="Fale com a gente"
        description="Dúvida sobre inscrição, kit ou parceria? Chama no WhatsApp que a gente responde."
      />
      <SectionBand className="border-t-0">
        <ContactChannelList />
      </SectionBand>
      <TrainingInfo />
    </>
  )
}
