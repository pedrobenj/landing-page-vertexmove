import "server-only"

import type { ADMIN_ROLE } from "@/enums/admin-role.enum"
import type { EVENT_STATUS } from "@/enums/event-status.enum"
import type { PAYMENT_STATUS } from "@/enums/payment-status.enum"
import type { REGISTRATION_STATUS } from "@/enums/registration-status.enum"
import type { AdminEventInput } from "@/types/api/admin-event.interface"
import type { AuditEntry } from "@/types/api/audit-entry.interface"
import type { Distance } from "@/types/api/distance.interface"
import type { EventDocument } from "@/types/api/document.interface"
import type { Kit } from "@/types/api/kit.interface"
import type { PartnerRace } from "@/types/api/partner-race.interface"
import type { PriceTier } from "@/types/api/price-tier.interface"
import type { ShirtSize } from "@/types/api/shirt-size.interface"

export interface MockEvent extends AdminEventInput {
  id: number
  status: EVENT_STATUS
  deletedAt: string | null
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
  /** Retirada do kit marcada no admin (`kit_retirado_em`). */
  kitRetiradoEm?: string | null
  /** Mudanças de status (detalhe do admin). Sem ela, o detalhe mostra só a criação. */
  historico?: { status: REGISTRATION_STATUS; em: string }[]
}

/** Linha de `pagamento` do backend, com o que o admin vê na fila de pendências. */
export interface MockPayment {
  id: number
  inscricaoId: number | null
  pedidoLojaCodigo: string | null
  status: PAYMENT_STATUS
  valorCentavos: number
  /** Valor informado pelo Mercado Pago; diferente de `valorCentavos` = divergência. */
  valorGatewayCentavos: number | null
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
  partnerRaces: PartnerRace[]
  /** Falhas de login seguidas por e-mail (lockout simplificado). */
  loginFailures: Record<string, number>
}
