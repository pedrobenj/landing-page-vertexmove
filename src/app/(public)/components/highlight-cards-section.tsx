import { Flag, Search, ShoppingBag, Ticket } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"

import { StaggerGroup, StaggerItem } from "@/components/motion"
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
      <StaggerGroup className="grid items-start gap-5 md:grid-cols-3">
        <StaggerItem as="div">
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
        </StaggerItem>
        <StaggerItem as="div" className="flex flex-col gap-3">
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
        </StaggerItem>
        <StaggerItem as="div">
          <HighlightCard
            title="Loja"
            description="Camisas e acessórios oficiais do Vertex."
            badge={<PillBadge icon={ShoppingBag}>Produtos oficiais</PillBadge>}
            linkLabel="Acessar a loja"
            href="/loja"
          />
        </StaggerItem>
      </StaggerGroup>
    </SectionBand>
  )
}
