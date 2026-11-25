import { CONTACT_INFO } from "./contact-info"
import { whatsappLink } from "./whatsapp-link"

const CONNECTIONS_MESSAGE = "Olá, Vertex! Quero participar das Conexões de sábado. Como faço?"

/** CTA "Quero participar" das Conexões: WhatsApp com mensagem pronta ou, sem número configurado, e-mail. */
export function getConnectionsContactHref(): string {
  const { whatsappNumber, email } = CONTACT_INFO
  if (whatsappNumber) return whatsappLink(whatsappNumber, CONNECTIONS_MESSAGE)
  return `mailto:${email}?subject=${encodeURIComponent("Conexões de sábado")}`
}
