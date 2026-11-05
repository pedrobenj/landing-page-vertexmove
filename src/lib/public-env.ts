/**
 * Variáveis públicas (expostas ao browser). Precisam ser lidas de forma literal
 * (process.env.NEXT_PUBLIC_X) para o Next.js conseguir embutir no bundle.
 */
export const publicEnv = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
  instagramUrl: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "",
}
