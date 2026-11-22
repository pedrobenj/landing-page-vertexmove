import type { ApiAdminPayment } from "@/types/api/admin-payment.interface"

export interface PaymentOrigin {
  label: string
  href: string
}

/**
 * Link da fila de pagamentos para o dono do pagamento. A origem da inscrição não traz a corrida: o link vai a
 * `/admin/inscricoes/:id`, que lê a inscrição e redireciona para `/admin/eventos/:eventoId/inscricoes/:id`.
 */
export function getPaymentOrigin(payment: Pick<ApiAdminPayment, "origem">): PaymentOrigin {
  const { origem } = payment
  if (origem.tipo === "pedido_loja") {
    return { label: `Pedido ${origem.codigo}`, href: `/admin/loja/pedidos/${encodeURIComponent(origem.codigo)}` }
  }
  return { label: `Inscrição ${origem.codigo}`, href: `/admin/inscricoes/${origem.inscricaoId}` }
}
