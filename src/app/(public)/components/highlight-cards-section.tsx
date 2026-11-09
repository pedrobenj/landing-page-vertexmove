import { Flag, Search, ShoppingBag, Ticket } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"

import { PillBadge, SectionBand } from "@/components/sections"
import { Button } from "@/components/ui/button"

import { HighlightCard } from "./highlight-card"
import { OpenEventsCountBadge } from "./open-events-count-badge"

export function HighlightCardsSection() {
  return (
    <SectionBand aria-labelledby="destaques-title" spacing="compact">
      <h2 id="destaques-title" className="sr-only">
        Destaques
      </h2>
      <div className="grid items-start gap-5 md:grid-cols-3">
        <HighlightCard
          title="Corridas"
          description="Provas de rua em Fortaleza para todos os ritmos."
          badge={
            <Suspense fallback={<PillBadge icon={Flag}>Inscrições abertas</PillBadge>}>
              <OpenEventsCountBadge />
            </Suspense>
          }
          linkLabel="Garantir minha vaga"
          href="#corridas"
        />
        <div className="flex flex-col gap-3">
          <HighlightCard
            title="Inscrição"
            description="Sem login e sem senha: só o WhatsApp ou o CPF."
            badge={<PillBadge icon={Search}>Sem login</PillBadge>}
            linkLabel="Consultar"
            href="/consulta"
          />
          <Button asChild variant="cta" size="xl" className="w-full normal-case tracking-normal shadow-md">
            <Link href="/consulta">
              <Ticket aria-hidden="true" />
              Acompanhe sua inscrição
            </Link>
          </Button>
        </div>
        <HighlightCard
          title="Loja"
          description="Camisas e medalhas oficiais do Vertex."
          badge={<PillBadge icon={ShoppingBag}>Produtos oficiais</PillBadge>}
          linkLabel="Acessar a loja"
          href="/loja"
        />
      </div>
    </SectionBand>
  )
}
