import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ServerError } from "@/components/feedback"
import { SectionBand, SectionHeading } from "@/components/sections"
import { publicEnv } from "@/lib/public-env"
import { buildEventJsonLd, getLowestPrice, serializeJsonLd, truncateText } from "@/lib/utils"
import { isApiError } from "@/server/api/api-error"
import { getPublicEvent } from "@/server/api/endpoints/events"
import type { PublicEventDetail } from "@/types/api/public-event-detail.interface"

import {
  DistanceList,
  EventCtaBand,
  EventDocuments,
  EventFaq,
  EventHero,
  KitList,
  MobileRegistrationBar,
  ShirtSizeList,
} from "./components"

/**
 * A página bloqueia (sem <Suspense>) até ler o evento: assim o `notFound()` roda antes do streaming
 * começar e devolve um 404 de verdade (mesmo padrão de /loja/[slug]).
 */
export const instant = false

const META_DESCRIPTION_MAX_LENGTH = 155

export async function generateMetadata({ params }: PageProps<"/corridas/[slug]">): Promise<Metadata> {
  const { slug } = await params

  let event: PublicEventDetail
  try {
    event = await getPublicEvent(slug)
  } catch (error) {
    if (isApiError(error) && error.status === 404) notFound()
    // A página trata o erro (ServerError); aqui só caímos no título padrão.
    return { title: "Corrida" }
  }

  const description = truncateText(event.descricao, META_DESCRIPTION_MAX_LENGTH)
  return {
    title: event.nome,
    description,
    alternates: { canonical: `/corridas/${event.slug}` },
    openGraph: {
      type: "website",
      title: event.nome,
      description,
      url: `/corridas/${event.slug}`,
      ...(event.imagemCapaUrl && { images: [{ url: event.imagemCapaUrl, alt: event.nome }] }),
    },
  }
}

export default async function EventPage({ params }: PageProps<"/corridas/[slug]">) {
  const { slug } = await params

  let event: PublicEventDetail
  try {
    event = await getPublicEvent(slug)
  } catch (error) {
    if (isApiError(error) && error.status === 404) notFound()
    console.error("[EventPage]", error)
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <ServerError title="Não foi possível carregar a corrida" />
      </div>
    )
  }

  const lowestPrice = getLowestPrice(event.distancias)
  // Absoluto: "./inscricao" a partir de /corridas/[slug] (sem barra final) resolveria para /corridas/inscricao.
  const registrationHref = `/corridas/${event.slug}/inscricao`
  const jsonLd = buildEventJsonLd(event, { siteUrl: publicEnv.siteUrl, lowestPrice })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />

      <EventHero event={event} lowestPrice={lowestPrice} registrationHref={registrationHref} />

      <SectionBand tone="muted" id="distancias" aria-labelledby="distancias-title">
        <SectionHeading
          id="distancias-title"
          eyebrow="Distâncias e preços"
          title="Escolha sua distância"
          description="Valores do lote vigente. Garanta sua vaga antes da virada de lote."
        />
        <DistanceList distances={event.distancias} eventStartTime={event.horarioLargada} />
      </SectionBand>

      <SectionBand aria-labelledby="kits-title">
        <SectionHeading
          id="kits-title"
          eyebrow="Kit do atleta"
          title="Escolha seu kit"
          description="Você escolhe o kit e o tamanho da camisa na inscrição."
        />
        <KitList kits={event.kits} />
        <ShirtSizeList sizes={event.tamanhosCamisa} />
      </SectionBand>

      <SectionBand tone="muted" aria-labelledby="documentos-title">
        <SectionHeading
          id="documentos-title"
          eyebrow="Antes de se inscrever"
          title="Regulamento e documentos"
          description="Leia com atenção: na inscrição você confirma o aceite do regulamento e do termo de responsabilidade."
        />
        <EventDocuments documents={event.documentosVigentes} slug={event.slug} />
      </SectionBand>

      <SectionBand aria-labelledby="faq-title" containerClassName="lg:grid lg:grid-cols-[1fr_1.4fr] lg:items-start lg:gap-12">
        <SectionHeading
          id="faq-title"
          eyebrow="Dúvidas"
          title="Perguntas frequentes"
          description="Não encontrou sua resposta? Fale com a gente pelo WhatsApp."
        />
        <EventFaq />
      </SectionBand>

      {/* Sem preço (tudo esgotado) não há para onde convidar: a faixa final some. */}
      {lowestPrice !== null && <EventCtaBand eventName={event.nome} registrationHref={registrationHref} />}

      <MobileRegistrationBar lowestPrice={lowestPrice} registrationHref={registrationHref} />
    </>
  )
}
