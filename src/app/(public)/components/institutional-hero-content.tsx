import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { HERO_CASCADE_DELAYS } from "@/animations/hero"
import { Chevron } from "@/components/brand"
import { HeroTitle, Reveal } from "@/components/motion"
import { PillBadge } from "@/components/sections"
import { Button } from "@/components/ui/button"

/** Hero sem corrida aberta (ou com a API fora): convite institucional, sem prometer data. */
export function InstitutionalHeroContent() {
  return (
    <>
      <div className="flex flex-col items-start gap-6">
        <Reveal trigger="mount" delay={HERO_CASCADE_DELAYS.pill}>
          <PillBadge dot>Vertex Grupo de Corrida</PillBadge>
        </Reveal>
        <HeroTitle
          id="hero-title"
          text="Todo corredor tem um topo. Qual é o seu?"
          className="font-heading text-4xl leading-[0.98] font-black tracking-tight sm:text-6xl lg:text-7xl"
        />
        <Reveal trigger="mount" delay={HERO_CASCADE_DELAYS.subtitle}>
          <p className="max-w-xl text-lg text-white/80">
            No Vertex, cada prova é um degrau. Corridas de rua em Fortaleza, para todos os ritmos.
          </p>
        </Reveal>
        <Reveal trigger="mount" delay={HERO_CASCADE_DELAYS.actions} className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button asChild variant="cta" size="xl" className="normal-case tracking-normal">
            <Link href="/sobre">
              Conheça o Vertex
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="xl" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">
            <Link href="/corridas/encerradas">Topos conquistados</Link>
          </Button>
        </Reveal>
      </div>
      <div aria-hidden="true" className="hidden justify-center lg:flex">
        <Chevron className="w-80 opacity-90" />
      </div>
    </>
  )
}
