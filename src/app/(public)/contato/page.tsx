import type { Metadata } from "next"

import { SectionBand, SectionHeading } from "@/components/sections"

import { ContactChannelList, TrainingInfo } from "./components"

export const metadata: Metadata = {
  title: "Fale com a gente",
  description: "Fale com o Vertex Grupo de Corrida pelo WhatsApp, Instagram ou e-mail.",
  alternates: { canonical: "/contato" },
}

export default function ContactPage() {
  return (
    <>
      <SectionBand aria-labelledby="contato-title" className="border-t-0">
        <SectionHeading
          as="h1"
          id="contato-title"
          eyebrow="Contato"
          title="Fale com a gente"
          description="Dúvida sobre inscrição, kit ou parceria? Chama no WhatsApp que a gente responde."
        />
        <ContactChannelList />
      </SectionBand>
      <TrainingInfo />
    </>
  )
}
