import { CONTACT_INFO } from "./contact-info"
import { whatsappLink } from "./whatsapp-link"

const PARTNERSHIP_MESSAGE = "Olá, Vertex! Tenho interesse em ser parceiro do grupo."

/** Link do CTA "Quero ser parceiro": WhatsApp com mensagem pronta ou, sem número configurado, e-mail. */
export function getPartnershipContactHref(): string {
  const { whatsappNumber, email } = CONTACT_INFO
  if (whatsappNumber) return whatsappLink(whatsappNumber, PARTNERSHIP_MESSAGE)
  return `mailto:${email}?subject=${encodeURIComponent("Parceria com o Vertex")}`
}
