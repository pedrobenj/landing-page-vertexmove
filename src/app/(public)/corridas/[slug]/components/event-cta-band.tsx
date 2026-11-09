import { ArrowRight, Flag } from "lucide-react"
import Link from "next/link"

import { SectionBand } from "@/components/sections"
import { Button } from "@/components/ui/button"

interface EventCtaBandProps {
  eventName: string
  registrationHref: string
}

/**
 * Faixa final na cor de destaque com o convite para a inscrição. Verde (e não navy) para não se fundir
 * com o rodapé escuro logo abaixo.
 */
export function EventCtaBand({ eventName, registrationHref }: EventCtaBandProps) {
  return (
    <SectionBand tone="accent" spacing="compact" aria-labelledby="event-cta-title">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand-navy-deep text-brand-green">
            <Flag aria-hidden="true" className="size-6" />
          </span>
          <div className="flex flex-col gap-2">
            <h2 id="event-cta-title" className="font-heading text-3xl font-black sm:text-4xl">
              Bora correr com a gente?
            </h2>
            <p className="max-w-xl text-brand-navy-deep/85">
              Garanta sua vaga na {eventName} enquanto o lote atual está valendo.
            </p>
          </div>
        </div>
        <Button asChild size="xl" className="hidden bg-brand-navy-deep font-bold text-white hover:bg-brand-navy md:inline-flex">
          <Link href={registrationHref}>
            Inscrever-se
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </SectionBand>
  )
}
