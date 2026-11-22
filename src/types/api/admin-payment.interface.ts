import type { PAYMENT_ISSUE } from "@/enums/payment-issue.enum"
import type { PAYMENT_STATUS } from "@/enums/payment-status.enum"

/** Inscrição dona do pagamento (para o link ao detalhe no admin). */
export interface ApiAdminPaymentRegistration {
  id: number
  codigo: string
  eventoId: number
}

/** Pedido da loja dono do pagamento. */
export interface ApiAdminPaymentStoreOrder {
  codigo: string
}

/** Item de `GET /admin/pagamentos?situacao` (`CursorPage`): pagamentos que pedem ação do admin. */
export interface ApiAdminPayment {
  id: number
  status: PAYMENT_STATUS
  situacao: PAYMENT_ISSUE
  valorCentavos: number
  valorGatewayCentavos: number | null
  criadoEm: string
  atualizadoEm: string
  estornoSolicitadoEm: string | null
  estornoMotivo: string | null
  inscricao: ApiAdminPaymentRegistration | null
  pedidoLoja: ApiAdminPaymentStoreOrder | null
}
