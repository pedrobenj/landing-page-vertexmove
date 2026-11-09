import type { PublicEventDetail } from "@/types/api/public-event-detail.interface"

/** Fuso de Fortaleza (sem horário de verão). */
const FORTALEZA_OFFSET = "-03:00"

interface BuildEventJsonLdOptions {
  siteUrl: string
  lowestPrice: number | null
}

/** JSON-LD `SportsEvent` (schema.org) da página do evento. */
export function buildEventJsonLd(event: PublicEventDetail, { siteUrl, lowestPrice }: BuildEventJsonLdOptions) {
  const { localizacao } = event
  const url = `${siteUrl}/corridas/${event.slug}`
  const street = [localizacao.endereco, localizacao.complemento, localizacao.bairro].filter(Boolean).join(", ")
  const hasGeo = typeof localizacao.latitude === "number" && typeof localizacao.longitude === "number"

  return {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: event.nome,
    description: event.descricao,
    url,
    startDate: `${event.dataEvento}T${event.horarioLargada}:00${FORTALEZA_OFFSET}`,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    sport: "Corrida de rua",
    ...(event.imagemCapaUrl && { image: [event.imagemCapaUrl] }),
    location: {
      "@type": "Place",
      name: localizacao.localNome,
      address: {
        "@type": "PostalAddress",
        ...(street && { streetAddress: street }),
        addressLocality: localizacao.cidade,
        addressRegion: localizacao.uf,
        ...(localizacao.cep && { postalCode: localizacao.cep }),
        addressCountry: "BR",
      },
      ...(hasGeo && {
        geo: { "@type": "GeoCoordinates", latitude: localizacao.latitude, longitude: localizacao.longitude },
      }),
    },
    organizer: { "@type": "SportsOrganization", name: "Vertex Grupo de Corrida", url: siteUrl },
    ...(lowestPrice !== null && {
      offers: {
        "@type": "Offer",
        url: `${url}/inscricao`,
        price: (lowestPrice / 100).toFixed(2),
        priceCurrency: "BRL",
        availability: "https://schema.org/InStock",
      },
    }),
  }
}

/** Serializa para `<script type="application/ld+json">`, escapando `<` contra XSS. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c")
}
