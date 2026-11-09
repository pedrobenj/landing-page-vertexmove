import type { PublicEventDetail } from "@/types/api/public-event-detail.interface"

/** Fuso de Fortaleza (sem horário de verão). */
const FORTALEZA_OFFSET = "-03:00"
/** `HH:mm`, aceitando segundos opcionais (`HH:mm:ss`), que são descartados. */
const START_TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/

/** Data/hora ISO da largada; sem horário válido, só a data (também aceita pelo schema.org). */
function buildStartDate(date: string, startTime: string): string {
  return START_TIME_PATTERN.test(startTime) ? `${date}T${startTime.slice(0, 5)}:00${FORTALEZA_OFFSET}` : date
}

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
    startDate: buildStartDate(event.dataEvento, event.horarioLargada),
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
