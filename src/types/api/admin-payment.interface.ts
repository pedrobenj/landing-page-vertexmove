import type { PAYMENT_STATUS } from "@/enums/payment-status.enum"

/** Dono do pagamento: `codigo` é a `external_reference` (`VX-…` ou `VTX-P-…`). */
export type ApiAdminPaymentOrigin =
  | { tipo: "inscricao"; inscricaoId: number; eventoId: number; codigo: string }
  | { tipo: "pedido_loja"; pedidoLojaId: number; codigo: string }

/**
 * Item de `GET /admin/pagamentos?situacao=` (`CursorPage`, `PendenciaPagamentoResponse`). A situação é o
 * filtro da consulta (obrigatório); `acoes` diz o que o painel pode oferecer na linha.
 */
export interface ApiAdminPayment {
  id: number
  status: PAYMENT_STATUS
  valorCentavos: number
  valorGatewayCentavos: number | null
  gatewayPaymentId: string | null
  gatewayStatus: string | null
  metodo: string | null
  pagoEm: string | null
  estornoSolicitadoEm: string | null
  /** Código do motivo (`cancelamento_admin`, `pagamento_divergente`…) ou o texto do admin no estorno. */
  estornoMotivo: string | null
  criadoEm: string
  atualizadoEm: string
  origem: ApiAdminPaymentOrigin
  acoes: { conciliar: boolean; estornar: boolean }
}
