import "server-only"

import type { ADMIN_ROLE } from "@/enums/admin-role.enum"
import type { EVENT_STATUS } from "@/enums/event-status.enum"
import type { PAYMENT_STATUS } from "@/enums/payment-status.enum"
import type { REGISTRATION_STATUS } from "@/enums/registration-status.enum"
import type { AdminEventInput } from "@/types/api/admin-event.interface"
import type { ApiKitPickup } from "@/types/api/api-event-detail.interface"
import type { AuditEntry } from "@/types/api/audit-entry.interface"
import type { Distance } from "@/types/api/distance.interface"
import type { EventDocument } from "@/types/api/document.interface"
import type { Kit } from "@/types/api/kit.interface"
import type { AdminLgpdRequest } from "@/types/api/lgpd-request.interface"
import type { AdminPartnerRace } from "@/types/api/partner-race.interface"
import type { PriceTier } from "@/types/api/price-tier.interface"
import type { ShirtSize } from "@/types/api/shirt-size.interface"

type KitPickupField = "retiradaKitLocal" | "retiradaKitEndereco" | "retiradaKitInicio" | "retiradaKitFim" | "retiradaKitInstrucoes"

export interface MockEvent extends Omit<AdminEventInput, KitPickupField> {
  id: number
  status: EVENT_STATUS
  deletedAt: string | null
  /** Colunas `retirada_kit_*` do evento, já no formato do presenter (`retiradaDoEvento`). */
  retiradaKit: ApiKitPickup | null
}

export interface MockDistance extends Distance {
  /** Vagas já ocupadas no seed (simula inscrições anteriores, para testar "Esgotado"). */
  vagasOcupadasSeed: number
}

export interface MockAdmin {
  id: number
  nome: string
  email: string
  senha: string
  papel: ADMIN_ROLE
  mfaAtivo: boolean
  /** Desativado não entra nem usa tokens já emitidos (gestão de admins, fase 8). */
  ativo: boolean
  ultimoAcessoEm: string | null
  criadoEm: string
}

export interface MockRegistration {
  id: number
  codigo: string
  /** Referência opaca devolvida na consulta (pedido de comprovante). */
  referencia: string
  /** Credencial da inscrição (`Authorization: Bearer`), como no backend. */
  accessToken: string
  eventoId: number
  distanciaId: number
  kitId: number | null
  tamanhoCamisaId: number | null
  nomeCompleto: string
  dataNascimento: string
  cpf: string | null
  whatsapp: string | null
  email: string | null
  documentosAceitos: number[]
  status: REGISTRATION_STATUS
  valorBaseCentavos: number
  valorDescontoCentavos: number
  valorTotalCentavos: number
  inscritoEm: string
  /** Último pagamento simulado no checkout falso (`null` = ainda não foi ao checkout). */
  pagamentoStatus?: PAYMENT_STATUS | null
  /** Quando o "webhook" simulado aprova o pagamento (ms); imita o atraso do Mercado Pago. */
  aprovacaoEm?: number | null
  /** Retirada do kit marcada no admin (`kit_retirado_em`, `kit_retirado_por`). */
  kitRetiradoEm?: string | null
  kitRetiradoPor?: number | null
  confirmadaEm?: string | null
  encerradaEm?: string | null
  motivoEncerramento?: string | null
  /** `inscricao_status_historico` (detalhe do admin). Sem ela, o detalhe mostra só a criação. */
  historico?: MockStatusChange[]
}

export interface MockStatusChange {
  statusAnterior: REGISTRATION_STATUS | null
  statusNovo: REGISTRATION_STATUS
  origem: "sistema" | "admin" | "gateway" | "atleta"
  motivo: string | null
  em: string
}

/** Linha de `pagamento` do backend, com o que o admin vê na fila de pendências. */
export interface MockPayment {
  id: number
  inscricaoId: number | null
  pedidoLojaCodigo: string | null
  status: PAYMENT_STATUS
  valorCentavos: number
  /** Valor informado pelo Mercado Pago. */
  valorGatewayCentavos: number | null
  gatewayPaymentId: string | null
  gatewayStatus: string | null
  metodo: string | null
  criadoEm: string
  atualizadoEm: string
  pagoEm: string | null
  estornoSolicitadoEm: string | null
  estornoMotivo: string | null
}

export interface MockDb {
  events: MockEvent[]
  distances: MockDistance[]
  priceTiers: PriceTier[]
  kits: Kit[]
  shirtSizes: ShirtSize[]
  documents: EventDocument[]
  admins: MockAdmin[]
  registrations: MockRegistration[]
  payments: MockPayment[]
  audit: AuditEntry[]
  partnerRaces: AdminPartnerRace[]
  /** `solicitacao_titular` (LGPD). */
  lgpdRequests: MockLgpdRequest[]
  /** Falhas de login seguidas por e-mail (lockout simplificado). */
  loginFailures: Record<string, number>
}

/** Linha de `solicitacao_titular`: o detalhe do admin + o CPF (no backend, hash e cifra; nunca exposto). */
export interface MockLgpdRequest extends Omit<AdminLgpdRequest, "cpfMascarado" | "vencida" | "nomeMascarado"> {
  cpf: string
}
