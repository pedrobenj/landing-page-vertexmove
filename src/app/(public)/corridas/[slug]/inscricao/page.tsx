import { ArrowLeft } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { ServerError } from "@/components/feedback"
import { SectionBand, SectionHeading } from "@/components/sections"
import { formatApiDateLong, getRegistrationAvailability } from "@/lib/utils"
import { isApiError } from "@/server/api/api-error"
import { getPublicEvent } from "@/server/api/endpoints/events"
import type { PublicEventDetail } from "@/types/api/public-event-detail.interface"

import { RegistrationClosedNotice, RegistrationWizard } from "./components"

/**
 * Bloqueante (sem <Suspense>) até ler o evento: o `notFound()` roda antes do streaming e devolve 404
 * de verdade (mesmo padrão de /corridas/[slug]).
 */
export const instant = false

export const metadata: Metadata = {
  title: "Inscrição",
  robots: { index: false, follow: false },
}

export default async function RegistrationPage({ params }: PageProps<"/corridas/[slug]/inscricao">) {
  const { slug } = await params

  let event: PublicEventDetail
  try {
    event = await getPublicEvent(slug)
  } catch (error) {
    if (isApiError(error) && error.status === 404) notFound()
    console.error("[RegistrationPage]", error instanceof Error ? error.name : "erro desconhecido")
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <ServerError title="Não foi possível carregar a inscrição" />
      </div>
    )
  }

  const eventHref = `/corridas/${event.slug}`
  const availability = getRegistrationAvailability(event)

  return (
    <SectionBand aria-labelledby="inscricao-title" className="border-t-0" spacing="compact" containerClassName="max-w-4xl gap-8">
      <Link
        href={eventHref}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-bold text-brand-navy underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Voltar para a corrida
      </Link>
      <SectionHeading
        as="h1"
        id="inscricao-title"
        eyebrow="Inscrição"
        title={event.nome}
        description={`${formatApiDateLong(event.dataEvento)} · ${event.localizacao.localNome}, ${event.localizacao.cidade}/${event.localizacao.uf}`}
        className="[&_p:last-child]:first-letter:uppercase"
      />

      {availability.status === "open" ? (
        <RegistrationWizard event={event} regulation={availability.regulation} liabilityTerm={availability.liabilityTerm} />
      ) : availability.status === "sold-out" ? (
        <RegistrationClosedNotice
          title="Inscrições esgotadas"
          description="Todas as vagas desta corrida foram preenchidas. Fique de olho no nosso Instagram para as próximas!"
          eventHref={eventHref}
        />
      ) : (
        <RegistrationClosedNotice
          title="Inscrições em breve"
          description="Inscrições em breve para esta corrida. Volte em alguns dias!"
          eventHref={eventHref}
        />
      )}
    </SectionBand>
  )
}
