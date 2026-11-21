import "server-only"

import { randomUUID } from "node:crypto"

import type { PAYMENT_STATUS } from "@/enums/payment-status.enum"
import type { ApiStoreCheckout } from "@/types/api/store-order.interface"

import { apiFetch } from "../api-client"

/**
 * `POST /loja/pedidos/:codigo/pagamentos` — cria ou reaproveita a preferência do Checkout Pro do pedido.
 * Exige o `accessToken` do pedido (cookie `vm_pedido_<codigo>`). A `Idempotency-Key` é nova a cada clique:
 * o backend reaproveita a cobrança ativa do pedido.
 */
export async function createStoreOrderCheckout(codigo: string, accessToken: string): Promise<ApiStoreCheckout> {
  return apiFetch(`/loja/pedidos/${encodeURIComponent(codigo)}/pagamentos`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Idempotency-Key": randomUUID() },
  })
}

/** Só no modo mock: simula o webhook do Mercado Pago para o pedido. */
export async function simulateMockStorePayment(codigo: string, resultado: PAYMENT_STATUS): Promise<void> {
  await apiFetch(`/dev/loja/pedidos/${encodeURIComponent(codigo)}/pagamento`, { method: "POST", body: { resultado } })
}
