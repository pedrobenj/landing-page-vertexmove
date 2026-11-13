import type { PAYMENT_STATUS } from "@/enums/payment-status.enum"
import type { REGISTRATION_STATUS } from "@/enums/registration-status.enum"

/**
 * Status da inscrição como as telas usam (`/inscricao/retorno` e `/inscricao/[code]`), sem PII.
 * Montado a partir de `ApiRegistrationStatus` por `toRegistrationDetails`: campos que o backend ainda
 * não envia (slug, data, valores base/desconto) chegam como `null`.
 */
export interface RegistrationDetails {
  codigo: string
  status: REGISTRATION_STATUS
  evento: {
    slug: string | null
    nome: string
    dataEvento: string | null // YYYY-MM-DD
    horarioLargada: string | null // HH:mm
  }
  distancia: string
  valorBaseCentavos: number | null
  valorDescontoCentavos: number | null
  valorTotalCentavos: number
  /** Último pagamento iniciado no Mercado Pago; `null` se o atleta ainda não foi ao checkout. */
  pagamento: { status: PAYMENT_STATUS } | null
}

/** Resposta real do checkout (`CheckoutResponse`), também aninhada no status da inscrição. */
export interface ApiCheckout {
  pagamentoId: number
  status: PAYMENT_STATUS
  checkoutUrl: string | null
  expiraEm: string | null
  gatewayPreferenceId: string | null
}

/** Resposta real de `GET /inscricoes/:codigo` (`StatusInscricaoResponse`). */
export interface ApiRegistrationStatus {
  codigo: string
  status: REGISTRATION_STATUS
  expiraEm: string
  valorTotalCentavos: number
  eventoNome: string
  distanciaNome: string
  /** Campos que a fase 3 pede ao backend; opcionais até lá. */
  eventoSlug?: string
  dataEvento?: string
  horarioLargada?: string
  pagamento: ApiCheckout | null
}

/** Link do Checkout Pro (`init_point`) já validado, devolvido ao client. */
export interface RegistrationCheckout {
  checkoutUrl: string
}
