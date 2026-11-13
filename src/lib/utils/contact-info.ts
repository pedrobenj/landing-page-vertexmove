import { publicEnv } from "@/lib/public-env"

/** Contatos oficiais. WhatsApp e Instagram vêm das variáveis NEXT_PUBLIC_*. */
export const CONTACT_INFO = {
  email: "contato@vertexcorrida.com.br", // TODO(cliente): e-mail oficial
  city: "Fortaleza/CE",
  whatsappNumber: publicEnv.whatsappNumber,
  instagramUrl: publicEnv.instagramUrl,
} as const

/** TODO(cliente): frase oficial do grupo (§16). */
export const SITE_TAGLINE = "Cada prova é um degrau."
