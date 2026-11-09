import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { HERO_CASCADE_DELAYS } from "@/animations/hero"
import { Chevron } from "@/components/brand"
import { HeroTitle, ParallaxLayer, Reveal } from "@/components/motion"
import { PillBadge } from "@/components/sections"
import { Button } from "@/components/ui/button"
import { SITE_TAGLINE } from "@/lib/utils"

// TODO(cliente): confirmar a frase do hero e a linha sobre o grupo.
export function HeroSection() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden bg-background">
      <div className="pointer-events-none absolute top-1/2 -right-24 w-[30rem] -translate-y-1/2 sm:-right-16 lg:w-[38rem]">
        <ParallaxLayer>
          <Chevron className="w-full opacity-[0.08]" />
        </ParallaxLayer>
      </div>
      <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-7 px-4 py-16 sm:py-24 lg:py-28">
        <Reveal trigger="mount" delay={HERO_CASCADE_DELAYS.pill}>
          <PillBadge tone="soft" dot>
            Vertex Grupo de Corrida
          </PillBadge>
        </Reveal>
        <HeroTitle
          id="hero-title"
          text={SITE_TAGLINE}
          className="font-heading text-5xl leading-[0.95] font-black tracking-tight text-brand-navy-deep sm:text-7xl lg:text-8xl"
        />
        <Reveal trigger="mount" delay={HERO_CASCADE_DELAYS.subtitle}>
          <p className="max-w-xl text-lg text-muted-foreground">
            Corridas de rua em Fortaleza, abertas a todos os ritmos. Vem correr com a gente!
          </p>
        </Reveal>
        <Reveal trigger="mount" delay={HERO_CASCADE_DELAYS.actions} className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button asChild variant="cta" size="xl" className="normal-case tracking-normal">
            <Link href="#corridas">
              Quero me inscrever
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="xl" className="shadow-sm">
            <Link href="/sobre">Conheça nossa história</Link>
          </Button>
        </Reveal>
      </div>
    </section>
  )
}
