import Link from "next/link"

import { Chevron } from "@/components/brand"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-brand-navy text-white">
      <Chevron className="pointer-events-none absolute -right-16 -bottom-10 w-80 opacity-15 sm:w-[28rem]" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-4 py-16 sm:py-24">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-green">
          Vertex Grupo de Corrida · Fortaleza/CE
        </p>
        <h1 className="max-w-2xl text-4xl leading-tight font-extrabold uppercase sm:text-5xl">
          Sua próxima corrida começa aqui
        </h1>
        <p className="max-w-xl text-white/80">
          Escolha a prova, a distância e o kit, pague com Pix e acompanhe sua inscrição pelo WhatsApp ou CPF.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="cta" size="xl">
            <Link href="#corridas">Quero me inscrever</Link>
          </Button>
          <Button asChild variant="outline" size="xl" className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white">
            <Link href="/consulta">Consultar minha inscrição</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
