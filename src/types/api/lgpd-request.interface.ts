import type { LGPD_REQUEST_STATUS } from "@/enums/lgpd-request-status.enum"
import type { LGPD_REQUEST_TYPE } from "@/enums/lgpd-request-type.enum"

/**
 * Corpo de `POST /lgpd/solicitacoes` (público, objeto estrito). Campos opcionais vão ausentes (o backend
 * não aceita `null`); `aceite` é obrigatório e literal `true`.
 */
export interface LgpdRequestInput {
  tipo: LGPD_REQUEST_TYPE
  nome: string
  cpf: string // só dígitos
  email?: string
  whatsapp?: string // E.164
  mensagem?: string
  aceite: true
}

/** `201` de `POST /lgpd/solicitacoes`: a mesma resposta exista ou não o CPF na base. */
export interface LgpdRequestReceipt {
  protocolo: string // LGPD-AAAA-XXXXXXXX
  status: LGPD_REQUEST_STATUS
  prazoEm: string // ISO-8601
}

/** Item de `GET /admin/lgpd/solicitacoes` (`presentSolicitacaoResumo`): sem PII além do nome mascarado. */
export interface AdminLgpdRequestSummary {
  id: number
  protocolo: string
  tipo: LGPD_REQUEST_TYPE
  status: LGPD_REQUEST_STATUS
  nomeMascarado: string
  prazoEm: string
  /** Prazo vencido sem resposta final. */
  vencida: boolean
  anonimizadaEm: string | null
  criadoEm: string
  atualizadoEm: string
}

/** Resposta de `PATCH /admin/lgpd/solicitacoes/:id`. */
export interface AdminLgpdRequestStatus extends AdminLgpdRequestSummary {
  resposta: string | null
  encerradaEm: string | null
}

/** `GET /admin/lgpd/solicitacoes/:id`: dados do requerente (o backend grava `visualizar_pii`). */
export interface AdminLgpdRequest extends AdminLgpdRequestStatus {
  nome: string
  cpfMascarado: string | null
  email: string | null
  whatsapp: string | null
  mensagem: string | null
  aceiteEm: string
  atualizadoPor: number | null
}

/** Corpo de `PATCH /admin/lgpd/solicitacoes/:id` (concluída/recusada exigem `resposta`). */
export interface LgpdRequestStatusInput {
  status: LGPD_REQUEST_STATUS
  resposta?: string
}

/** Resposta de `POST /admin/lgpd/solicitacoes/:id/anonimizar` (contagens do que foi apagado). */
export interface LgpdAnonymizationResult {
  protocolo: string
  anonimizadaEm: string
  atletas: number
  inscricoes: number
  pedidos: number
  notificacoes: number
}

/** Filtros de `GET /admin/lgpd/solicitacoes`. */
export interface AdminLgpdRequestFilters {
  status?: LGPD_REQUEST_STATUS
  tipo?: LGPD_REQUEST_TYPE
  cursor?: string
}
