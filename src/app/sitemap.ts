import type { MetadataRoute } from "next"

import { publicEnv } from "@/lib/public-env"

// TODO: incluir /corridas/[slug] dos eventos OPEN quando a página do evento existir.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = publicEnv.siteUrl
  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/consulta`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/medalhas`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/privacidade`, changeFrequency: "yearly", priority: 0.2 },
  ]
}
