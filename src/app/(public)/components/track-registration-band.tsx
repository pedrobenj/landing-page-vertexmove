import { Search } from "lucide-react"
import Link from "next/link"

import { SectionBand } from "@/components/sections"
import { Button } from "@/components/ui/button"

export function TrackRegistrationBand() {
  return (
    <SectionBand tone="dark" spacing="compact" aria-labelledby="acompanhe-title">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand-green text-brand-navy-deep">
            <Search aria-hidden="true" className="size-6" />
          </span>
          <div className="flex flex-col gap-2">
            <h2 id="acompanhe-title" className="font-heading text-3xl font-black sm:text-4xl">
              Acompanhe sua inscrição!
            </h2>
            <p className="max-w-xl text-white/75">
              Já se inscreveu em uma corrida do Vertex? Informe o WhatsApp ou o CPF e veja o status da sua inscrição,
              sem login e sem senha.
            </p>
          </div>
        </div>
        <Button asChild variant="cta" size="xl" className="w-full normal-case tracking-normal md:w-auto">
          <Link href="/consulta">
            <Search aria-hidden="true" />
            Consultar minha inscrição
          </Link>
        </Button>
      </div>
    </SectionBand>
  )
}
