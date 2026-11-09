import { ArrowLeft } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { ServerError } from "@/components/feedback"
import { SectionBand, SectionHeading } from "@/components/sections"
import { isApiError } from "@/server/api/api-error"
import { getPublicEvent } from "@/server/api/endpoints/events"
import type { PublicEventDetail } from "@/types/api/public-event-detail.interface"

import { RegulationDocumentList } from "./components"

/**
 * Bloqueia (sem <Suspense>) até ler o evento: o `notFound()` roda antes do streaming
 * e devolve 404 de verdade (mesmo padrão de /corridas/[slug]).
 */
export const instant = false

export async function generateMetadata({ params }: PageProps<"/regulamento/[slug]">): Promise<Metadata> {
  const { slug } = await params
  try {
    const event = await getPublicEvent(slug)
    return {
      title: `Regulamento — ${event.nome}`,
      description: `Regulamento e termo de responsabilidade da ${event.nome}.`,
      alternates: { canonical: `/regulamento/${event.slug}` },
    }
  } catch (error) {
    if (isApiError(error) && error.status === 404) notFound()
    return { title: "Regulamento" }
  }
}

export default async function RegulationPage({ params }: PageProps<"/regulamento/[slug]">) {
  const { slug } = await params

  let event: PublicEventDetail
  try {
    event = await getPublicEvent(slug)
  } catch (error) {
    if (isApiError(error) && error.status === 404) notFound()
    console.error("[RegulationPage]", error)
    return (
      <SectionBand className="border-t-0">
        <h1 className="sr-only">Regulamento</h1>
        <ServerError title="Não foi possível carregar o regulamento" />
      </SectionBand>
    )
  }

  return (
    <SectionBand aria-labelledby="regulamento-title" className="border-t-0" containerClassName="max-w-4xl">
      <Link
        href={`/corridas/${event.slug}`}
        className="-mb-4 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-brand-navy-deep focus-visible:outline-2 focus-visible:outline-brand-green"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Voltar para a corrida
      </Link>
      <SectionHeading
        as="h1"
        id="regulamento-title"
        eyebrow={event.nome}
        title="Regulamento"
        description="Leia com atenção antes de se inscrever: na inscrição você confirma o aceite do regulamento e do termo de responsabilidade."
      />
      <h2 className="sr-only">Documentos vigentes</h2>
      <RegulationDocumentList documents={event.documentosVigentes} eventSlug={event.slug} />
    </SectionBand>
  )
}
