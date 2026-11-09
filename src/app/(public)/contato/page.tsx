import type { Metadata } from "next"

import { SectionBand, SectionHeading } from "@/components/sections"

import { ContactChannelList, TrainingInfo } from "./components"

export const metadata: Metadata = {
  title: "Contato",
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
          eyebrow="Fale com a gente"
          title="Contato"
          description="Dúvida sobre inscrição, kit ou parceria? A gente responde com prazer."
        />
        <ContactChannelList />
      </SectionBand>
      <TrainingInfo />
    </>
  )
}
