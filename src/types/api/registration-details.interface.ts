import type { PAYMENT_STATUS } from "@/enums/payment-status.enum"
import type { REGISTRATION_STATUS } from "@/enums/registration-status.enum"

/**
 * `GET /inscricoes/:codigo` — status da inscrição para a página de retorno do Checkout Pro e `/inscricao/[code]`.
 * Contrato proposto ao backend (§16); sem PII.
 */
export interface RegistrationDetails {
  codigo: string
  status: REGISTRATION_STATUS
  evento: {
    slug: string
    nome: string
    dataEvento: string // YYYY-MM-DD
    horarioLargada: string // HH:mm
  }
  distancia: string
  valorBaseCentavos: number
  valorDescontoCentavos: number
  valorTotalCentavos: number
  /** Último pagamento iniciado no Mercado Pago; `null` se o atleta ainda não foi ao checkout. */
  pagamento: { status: PAYMENT_STATUS } | null
}

/** `POST /inscricoes/:codigo/pagamento` — link do Checkout Pro (`init_point` da preferência). */
export interface RegistrationCheckout {
  checkoutUrl: string
}
