import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { Chevron } from "@/components/brand"
import { PillBadge } from "@/components/sections"
import { Button } from "@/components/ui/button"

// TODO(cliente): confirmar a frase do hero e a linha sobre o grupo.
export function HeroSection() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden bg-background">
      <Chevron className="pointer-events-none absolute top-1/2 -right-24 w-[30rem] -translate-y-1/2 opacity-[0.08] sm:-right-16 lg:w-[38rem]" />
      <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-7 px-4 py-16 sm:py-24 lg:py-28">
        <PillBadge tone="soft" dot>
          Vertex Grupo de Corrida
        </PillBadge>
        <h1
          id="hero-title"
          className="font-heading text-5xl leading-[0.95] font-black tracking-tight text-brand-navy-deep sm:text-7xl lg:text-8xl"
        >
          Corra. Conecte-se. Evolua.
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Corridas de rua em Fortaleza, abertas a todos os ritmos. Vem correr com a gente!
        </p>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button asChild variant="cta" size="xl" className="normal-case tracking-normal">
            <Link href="#corridas">
              Quero me inscrever
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="xl" className="shadow-sm">
            <Link href="/sobre">Conheça nossa história</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
