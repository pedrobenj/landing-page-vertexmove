import type { MetadataRoute } from "next"
import { connection } from "next/server"

import { publicEnv } from "@/lib/public-env"
import { isApiError } from "@/server/api/api-error"
import { listPublicEvents } from "@/server/api/endpoints/events"
import { isStoreEnabled } from "@/server/api/endpoints/store"
import type { PublicEvent } from "@/types/api/event.interface"

type SitemapEntry = MetadataRoute.Sitemap[number]

const STATIC_PAGES: Array<Pick<SitemapEntry, "changeFrequency" | "priority"> & { path: string }> = [
  { path: "", changeFrequency: "daily", priority: 1 },
  { path: "/consulta", changeFrequency: "monthly", priority: 0.6 },
  { path: "/sobre", changeFrequency: "monthly", priority: 0.5 },
  { path: "/parceiros", changeFrequency: "monthly", priority: 0.4 },
  { path: "/contato", changeFrequency: "monthly", priority: 0.4 },
  { path: "/corridas-parceiras", changeFrequency: "weekly", priority: 0.5 },
  { path: "/corridas/encerradas", changeFrequency: "monthly", priority: 0.4 },
  { path: "/privacidade", changeFrequency: "yearly", priority: 0.2 },
]

// A loja ainda não tem backend (§16): sem o mock, /loja só mostra "em breve" e não entra no sitemap.
const STORE_PAGE: (typeof STATIC_PAGES)[number] = { path: "/loja", changeFrequency: "weekly", priority: 0.7 }

/** Corridas publicadas; sem API (build, backend fora do ar) → nenhuma. */
async function loadEvents(): Promise<PublicEvent[]> {
  try {
    return (await listPublicEvents()).items
  } catch (error) {
    if (!isApiError(error)) throw error
    console.error("[sitemap]", error.message)
    return []
  }
}

/**
 * Renderizado sob demanda (`connection()`): a lista de corridas muda com o admin e, no build,
 * a API pode estar fora do ar. A chamada à API continua em cache ("use cache" em `listPublicEvents`).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection()
  const base = publicEnv.siteUrl
  const events = await loadEvents()

  return [
    ...[...STATIC_PAGES, ...(isStoreEnabled() ? [STORE_PAGE] : [])].map(({ path, ...entry }) => ({ url: `${base}${path}`, ...entry })),
    ...events.map((event) => ({
      url: `${base}/corridas/${event.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
  ]
}
