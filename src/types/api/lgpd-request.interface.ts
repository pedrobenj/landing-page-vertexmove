import type { LGPD_REQUEST_STATUS } from "@/enums/lgpd-request-status.enum"
import type { LGPD_REQUEST_TYPE } from "@/enums/lgpd-request-type.enum"

/** Corpo de `POST /lgpd/solicitacoes` (público, sem login). */
export interface LgpdRequestInput {
  tipo: LGPD_REQUEST_TYPE
  nomeCompleto: string
  cpf: string // só dígitos
  email: string | null
  whatsapp: string | null // E.164
  mensagem: string | null
}

/** Resposta de `POST /lgpd/solicitacoes`: mesma resposta exista ou não o titular. */
export interface LgpdRequestReceipt {
  protocolo: string
  prazoEm: string // ISO-8601
}

/** Item de `GET /admin/lgpd/solicitacoes` (sem PII além do nome mascarado). */
export interface AdminLgpdRequestSummary {
  id: number
  protocolo: string
  tipo: LGPD_REQUEST_TYPE
  status: LGPD_REQUEST_STATUS
  nomeMascarado: string
  titularEncontrado: boolean
  criadoEm: string
  prazoEm: string
}

/** `GET /admin/lgpd/solicitacoes/:id`: com os dados pessoais (o backend audita o acesso). */
export interface AdminLgpdRequest {
  id: number
  protocolo: string
  tipo: LGPD_REQUEST_TYPE
  status: LGPD_REQUEST_STATUS
  nomeCompleto: string
  cpf: string
  email: string | null
  whatsapp: string | null
  mensagem: string | null
  resposta: string | null
  titularEncontrado: boolean
  criadoEm: string
  prazoEm: string
  respondidoEm: string | null
  anonimizadoEm: string | null
}

/** Corpo de `POST /admin/lgpd/solicitacoes/:id/status`. */
export interface LgpdRequestStatusInput {
  status: LGPD_REQUEST_STATUS
  resposta: string | null
}

/** Filtros de `GET /admin/lgpd/solicitacoes`. */
export interface AdminLgpdRequestFilters {
  status?: LGPD_REQUEST_STATUS
  tipo?: LGPD_REQUEST_TYPE
  cursor?: string
}
