import "server-only"

import type { PAYMENT_ISSUE } from "@/enums/payment-issue.enum"
import type { ApiAdminPayment } from "@/types/api/admin-payment.interface"
import type { CursorPage } from "@/types/api/cursor-page.interface"

import { adminFetch } from "../admin-fetch"

// Pagamentos que pedem ação do admin (Bearer). Sem cache: a fila muda com o webhook e a conciliação.

/** `GET /admin/pagamentos?situacao&cursor&limit` — `situacao` obrigatória. Cobre inscrições e pedidos da loja. */
export async function listAdminPayments(query: { situacao: PAYMENT_ISSUE; cursor?: string; limit?: number }): Promise<CursorPage<ApiAdminPayment>> {
  const { situacao, cursor, limit } = query
  return adminFetch("/admin/pagamentos", { query: { situacao, cursor, limit } })
}

/** `POST /admin/pagamentos/:id/conciliar` (204): consulta o Mercado Pago e aplica o status real. */
export async function reconcilePayment(id: number): Promise<void> {
  await adminFetch<void>(`/admin/pagamentos/${id}/conciliar`, { method: "POST" })
}

/**
 * `POST /admin/pagamentos/:id/estornar` (204), corpo `{ motivo }` (1–500). Só aprovado ou em análise com estorno
 * pedido (`acoes.estornar`) → senão 409; Mercado Pago fora → 502 `GATEWAY_INDISPONIVEL`.
 */
export async function refundPayment(id: number, motivo: string): Promise<void> {
  await adminFetch<void>(`/admin/pagamentos/${id}/estornar`, { method: "POST", body: { motivo } })
}
