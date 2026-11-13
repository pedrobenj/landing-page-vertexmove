import { ShieldCheck } from "lucide-react"
import type { Metadata } from "next"

import { PageHero, SectionBand } from "@/components/sections"

import { LookupForm } from "./components"

export const metadata: Metadata = {
  title: "Consultar inscrição",
  description: "Consulte suas inscrições nas corridas do Vertex pelo WhatsApp ou CPF, sem login e sem senha.",
}

export default function LookupPage() {
  return (
    <>
      <PageHero
        id="consulta-title"
        eyebrow="Consultar inscrição"
        title="Onde está minha inscrição?"
        description="Sem login e sem senha: informe o WhatsApp ou o CPF da inscrição e veja suas provas e o status de cada uma."
        containerClassName="max-w-3xl"
      />
      <SectionBand className="border-t-0" containerClassName="max-w-3xl gap-8">
        <p className="flex gap-2 text-sm text-muted-foreground">
          <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand-green-text" />
          Por segurança (LGPD), mostramos apenas dados mascarados: nome parcial, corrida, distância e status.
        </p>
        <LookupForm />
      </SectionBand>
    </>
  )
}
