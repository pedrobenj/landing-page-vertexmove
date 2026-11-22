import type { PAYMENT_STATUS } from "@/enums/payment-status.enum"
import type { REGISTRATION_STATUS } from "@/enums/registration-status.enum"

/** Referência `{ id, nome }` (distância, kit, evento). */
export interface ApiAdminNamedRef {
  id: number
  nome: string
}

/** Pagamento resumido na lista: o aprovado, se houver; senão a tentativa mais recente. */
export interface ApiAdminRegistrationPayment {
  id: number
  status: PAYMENT_STATUS
}

/**
 * Item de `GET /admin/eventos/:eventoId/inscricoes` (`CursorPage`, `InscricaoAdminResponse`).
 * Sem contato. `cpfMascarado` é sempre `***.***.***-**` (o backend não decifra o CPF) ou `null`.
 * `status` é o efetivo (pendente vencida vem como `expirada`). Instantes em ISO-8601 UTC.
 */
export interface ApiAdminRegistration {
  id: number
  codigo: string
  nomeCompleto: string
  cpfMascarado: string | null
  distancia: ApiAdminNamedRef
  kit: ApiAdminNamedRef | null
  tamanhoCamisa: string | null
  status: REGISTRATION_STATUS
  valorTotalCentavos: number
  inscritoEm: string
  kitRetiradoEm: string | null
  pagamento: ApiAdminRegistrationPayment | null
}

export interface ApiAdminRegistrationAcceptance {
  documentoTipo: string
  documentoVersao: string
  documentoTitulo: string
  aceitoEm: string
}

/** `origem`: `sistema | admin | gateway | atleta`. */
export interface ApiAdminRegistrationStatusChange {
  statusAnterior: REGISTRATION_STATUS | null
  statusNovo: REGISTRATION_STATUS
  origem: string
  motivo: string | null
  em: string
}

export interface ApiAdminRegistrationPaymentDetails {
  id: number
  status: PAYMENT_STATUS
  valorCentavos: number
  metodo: string | null
  criadoEm: string
  pagoEm: string | null
  estornoSolicitadoEm: string | null
  estornoMotivo: string | null
}

/**
 * `GET /admin/inscricoes/:id` (`InscricaoAdminDetalheResponse`): contato e nascimento. O backend grava
 * a auditoria `visualizar_pii` e o `acesso_dado_pessoal` de cada campo exibido.
 */
export interface ApiAdminRegistrationDetails extends Omit<ApiAdminRegistration, "pagamento"> {
  evento: ApiAdminNamedRef
  email: string | null
  whatsapp: string | null
  dataNascimento: string | null
  valorBaseCentavos: number
  valorDescontoCentavos: number
  expiraEm: string
  confirmadaEm: string | null
  encerradaEm: string | null
  motivoEncerramento: string | null
  kitRetiradoPor: number | null
  anonimizado: boolean
  aceites: ApiAdminRegistrationAcceptance[]
  historico: ApiAdminRegistrationStatusChange[]
  pagamentos: ApiAdminRegistrationPaymentDetails[]
}

/** `200` de `POST /admin/inscricoes/:id/retirada-kit` (idempotente: repetir devolve o mesmo instante). */
export interface ApiKitPickup {
  id: number
  kitRetiradoEm: string
}

/** `200` de `POST /admin/inscricoes/:id/cancelar`. Já cancelada → `statusAnterior: null` (idempotente). */
export interface ApiCancelledRegistration {
  id: number
  status: "cancelada"
  statusAnterior: REGISTRATION_STATUS | null
  estornoSinalizado: boolean
  pagamentoId: number | null
}
