import { ArrowRight, CalendarDays, MapPin } from "lucide-react"
import Link from "next/link"

import { HERO_CASCADE_DELAYS } from "@/animations/hero"
import { HeroTitle, Reveal } from "@/components/motion"
import { CoverImage, PillBadge } from "@/components/sections"
import { Button } from "@/components/ui/button"
import { formatApiDate } from "@/lib/utils"
import type { PublicEvent } from "@/types/api/event.interface"

interface NextRaceHeroContentProps {
  event: PublicEvent
}

/** Hero com a próxima corrida aberta em destaque: o "próximo topo". */
export function NextRaceHeroContent({ event }: NextRaceHeroContentProps) {
  const { localizacao } = event

  return (
    <>
      <div className="flex flex-col items-start gap-6">
        <Reveal trigger="mount" delay={HERO_CASCADE_DELAYS.pill}>
          <PillBadge dot>Próximo topo</PillBadge>
        </Reveal>
        <HeroTitle
          id="hero-title"
          text={event.nome}
          className="font-heading text-4xl leading-[0.98] font-black tracking-tight sm:text-6xl lg:text-7xl"
        />
        <Reveal trigger="mount" delay={HERO_CASCADE_DELAYS.subtitle}>
          <ul className="flex flex-col gap-2 text-base text-white/85 sm:text-lg">
            <li className="flex items-center gap-2.5">
              <CalendarDays aria-hidden="true" className="size-5 shrink-0 text-brand-green" />
              <span>
                <time dateTime={event.dataEvento}>{formatApiDate(event.dataEvento)}</time> · largada {event.horarioLargada}
              </span>
            </li>
            <li className="flex items-center gap-2.5">
              <MapPin aria-hidden="true" className="size-5 shrink-0 text-brand-green" />
              {localizacao.localNome} — {localizacao.cidade}/{localizacao.uf}
            </li>
          </ul>
        </Reveal>
        <Reveal trigger="mount" delay={HERO_CASCADE_DELAYS.actions} className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button asChild variant="cta" size="xl" className="normal-case tracking-normal">
            <Link href={`/corridas/${event.slug}`}>
              Começar a subida
              <span className="sr-only"> na {event.nome}</span>
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="xl" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">
            <Link href="#corridas">Ver todas as provas</Link>
          </Button>
        </Reveal>
      </div>
      <Reveal trigger="mount" delay={HERO_CASCADE_DELAYS.subtitle} className="relative mx-auto w-full max-w-md lg:max-w-none">
        <div aria-hidden="true" className="absolute inset-0 translate-x-3 translate-y-3 -rotate-3 rounded-3xl bg-brand-green" />
        <div className="relative aspect-[4/3] -rotate-3 overflow-hidden rounded-3xl border-4 border-white/10 bg-brand-navy shadow-2xl">
          <CoverImage src={event.imagemCapaUrl} alt="" sizes="(min-width: 1024px) 480px, 90vw" priority />
        </div>
      </Reveal>
    </>
  )
}
