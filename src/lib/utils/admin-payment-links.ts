import type { ApiAdminPayment } from "@/types/api/admin-payment.interface"

export interface PaymentOrigin {
  label: string
  href: string
}

/** Link da fila de pagamentos para o dono do pagamento (detalhe da inscrição na corrida ou do pedido da loja). */
export function getPaymentOrigin(payment: Pick<ApiAdminPayment, "origem">): PaymentOrigin {
  const { origem } = payment
  if (origem.tipo === "pedido_loja") {
    return { label: `Pedido ${origem.codigo}`, href: `/admin/loja/pedidos/${encodeURIComponent(origem.codigo)}` }
  }
  return { label: `Inscrição ${origem.codigo}`, href: `/admin/eventos/${origem.eventoId}/inscricoes/${origem.inscricaoId}` }
}
