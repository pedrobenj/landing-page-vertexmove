import { ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"

import { Chevron } from "@/components/brand"
import { CoverImage, PillBadge } from "@/components/sections"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import type { PublicEvent } from "@/types/api/event.interface"

import { EventInfoList } from "./event-info-list"

interface EventHeroProps {
  event: PublicEvent
  lowestPrice: number | null
  registrationHref: string
}

/**
 * Topo da página do evento, na linguagem do hero da home: fundo navy com o pico esmaecido, capa
 * inclinada sobre a moldura verde, nome, data longa, largada, local e o CTA (no desktop).
 */
export function EventHero({ event, lowestPrice, registrationHref }: EventHeroProps) {
  return (
    <section aria-labelledby="event-title" className="relative overflow-hidden bg-brand-navy-deep text-white">
      <Chevron className="pointer-events-none absolute -bottom-24 -left-20 w-[30rem] opacity-[0.07] lg:w-[42rem]" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 pt-6 pb-12 sm:pt-8 lg:pb-16">
        <Link
          href="/#corridas"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-white/75 hover:text-brand-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Todas as provas
        </Link>

        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
          <div className="relative mx-2 lg:order-last">
            <div aria-hidden="true" className="absolute inset-0 translate-x-3 translate-y-3 -rotate-2 rounded-3xl bg-brand-green" />
            <div className="relative aspect-video -rotate-2 overflow-hidden rounded-3xl border-4 border-white/10 bg-brand-navy shadow-2xl lg:aspect-[4/3]">
              <CoverImage src={event.imagemCapaUrl} alt={event.nome} sizes="(min-width: 1024px) 520px, 100vw" priority />
              {lowestPrice !== null ? (
                <PillBadge className="absolute top-4 left-4">Inscrições abertas</PillBadge>
              ) : (
                <PillBadge className="absolute top-4 left-4 bg-white">Esgotado</PillBadge>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <p className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-brand-green uppercase">
                <Chevron className="h-2.5 w-4 shrink-0 text-current" />
                Prova Vertex
              </p>
              <h1
                id="event-title"
                className="font-heading text-4xl leading-[1.02] font-black tracking-tight text-white sm:text-5xl lg:text-6xl"
              >
                {event.nome}
              </h1>
              <p className="max-w-xl text-base text-white/80 sm:text-lg">{event.descricao}</p>
            </div>

            <EventInfoList event={event} />

            <div className="hidden items-center gap-6 border-t border-white/15 pt-6 md:flex">
              {lowestPrice !== null ? (
                <>
                  <Button asChild variant="cta" size="xl" className="normal-case tracking-normal">
                    <Link href={registrationHref}>
                      Inscrever-se
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  </Button>
                  <p className="flex flex-col">
                    <span className="text-xs font-bold tracking-wider text-white/65 uppercase">A partir de</span>
                    <span className="font-heading text-2xl font-black text-white">
                      {formatCurrency(lowestPrice)}
                    </span>
                  </p>
                </>
              ) : (
                <p className="font-heading text-2xl font-black text-white">Inscrições esgotadas</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
