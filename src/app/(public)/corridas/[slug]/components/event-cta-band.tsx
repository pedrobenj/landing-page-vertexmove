import { ArrowRight, Flag } from "lucide-react"
import Link from "next/link"

import { SectionBand } from "@/components/sections"
import { Button } from "@/components/ui/button"

interface EventCtaBandProps {
  eventName: string
  registrationHref: string
}

/** Faixa escura final com o convite para a inscrição (mesmo padrão da "Acompanhe sua inscrição" da home). */
export function EventCtaBand({ eventName, registrationHref }: EventCtaBandProps) {
  return (
    <SectionBand tone="dark" spacing="compact" aria-labelledby="event-cta-title">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand-green text-brand-navy-deep">
            <Flag aria-hidden="true" className="size-6" />
          </span>
          <div className="flex flex-col gap-2">
            <h2 id="event-cta-title" className="font-heading text-3xl font-black sm:text-4xl">
              Bora correr com a gente?
            </h2>
            <p className="max-w-xl text-white/75">
              Garanta sua vaga na {eventName} enquanto o lote atual está valendo.
            </p>
          </div>
        </div>
        <Button asChild variant="cta" size="xl" className="hidden normal-case tracking-normal md:inline-flex">
          <Link href={registrationHref}>
            Inscrever-se
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </SectionBand>
  )
}
