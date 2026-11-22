import type { DOCUMENT_TYPE } from "@/enums/document-type.enum"
import type { PAYMENT_STATUS } from "@/enums/payment-status.enum"
import type { REGISTRATION_STATUS } from "@/enums/registration-status.enum"

/** Último pagamento da inscrição, resumido na lista. */
export interface ApiAdminRegistrationPayment {
  id: number
  status: PAYMENT_STATUS
}

/** Item de `GET /admin/eventos/:eventoId/inscricoes` (`CursorPage`). CPF mascarado; contato só no detalhe. */
export interface ApiAdminRegistration {
  id: number
  codigo: string
  nomeCompleto: string
  cpfMascarado: string | null
  distancia: string
  kit: string | null
  tamanhoCamisa: string | null
  status: REGISTRATION_STATUS
  valorTotalCentavos: number
  inscritoEm: string
  kitRetiradoEm: string | null
  pagamento: ApiAdminRegistrationPayment | null
}

export interface ApiAdminRegistrationAcceptance {
  documentoId: number
  tipo: DOCUMENT_TYPE
  versao: string
  aceitoEm: string
}

export interface ApiAdminRegistrationStatusChange {
  status: REGISTRATION_STATUS
  em: string
}

export interface ApiAdminRegistrationPaymentDetails {
  id: number
  status: PAYMENT_STATUS
  valorCentavos: number
  criadoEm: string
  pagoEm: string | null
  estornoSolicitadoEm: string | null
}

/** `GET /admin/inscricoes/:id`: dados completos do atleta (a leitura é registrada como acesso a PII). */
export interface ApiAdminRegistrationDetails extends ApiAdminRegistration {
  eventoId: number
  evento: string
  dataNascimento: string
  whatsapp: string | null
  email: string | null
  valorBaseCentavos: number
  valorDescontoCentavos: number
  expiraEm: string | null
  aceites: ApiAdminRegistrationAcceptance[]
  historico: ApiAdminRegistrationStatusChange[]
  pagamentos: ApiAdminRegistrationPaymentDetails[]
}
