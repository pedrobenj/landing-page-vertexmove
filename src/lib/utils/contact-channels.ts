import type { ContactChannel } from "@/types/contact-channel.interface"

import { CONTACT_INFO } from "./contact-info"
import { formatInstagramHandle } from "./format-instagram-handle"
import { formatPhoneDisplay } from "./format-phone-display"
import { whatsappLink } from "./whatsapp-link"

const UNAVAILABLE = "Em breve"

/** Canais de `/contato`, na ordem de preferência (WhatsApp primeiro: o público chega pelo celular). */
export function getContactChannels(): ContactChannel[] {
  const { whatsappNumber, instagramUrl, email } = CONTACT_INFO
  const instagramHandle = formatInstagramHandle(instagramUrl)

  return [
    {
      kind: "whatsapp",
      label: "WhatsApp",
      value: whatsappNumber ? formatPhoneDisplay(whatsappNumber) : UNAVAILABLE,
      description: "O jeito mais rápido de tirar dúvidas sobre inscrições, kits e provas.",
      href: whatsappNumber ? whatsappLink(whatsappNumber, "Olá, Vertex! Vim pelo site.") : undefined,
      external: true,
    },
    {
      kind: "instagram",
      label: "Instagram",
      value: instagramHandle || UNAVAILABLE,
      description: "Novidades, fotos das provas e os bastidores do grupo.",
      href: instagramUrl || undefined,
      external: true,
    },
    {
      kind: "email",
      label: "E-mail",
      value: email,
      description: "Para parcerias, patrocínios e assuntos que pedem mais detalhes.",
      href: `mailto:${email}`,
      external: false,
    },
  ]
}
