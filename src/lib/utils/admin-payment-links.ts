import type { ApiAdminPayment } from "@/types/api/admin-payment.interface"

export interface PaymentOrigin {
  label: string
  href: string
}

/** Link da fila de pagamentos para o dono do pagamento (inscrição ou pedido da loja). */
export function getPaymentOrigin(payment: Pick<ApiAdminPayment, "inscricao" | "pedidoLoja">): PaymentOrigin | null {
  if (payment.inscricao) {
    const { id, codigo, eventoId } = payment.inscricao
    return { label: `Inscrição ${codigo}`, href: `/admin/eventos/${eventoId}/inscricoes/${id}` }
  }
  if (payment.pedidoLoja) {
    const { codigo } = payment.pedidoLoja
    return { label: `Pedido ${codigo}`, href: `/admin/loja/pedidos/${encodeURIComponent(codigo)}` }
  }
  return null
}
