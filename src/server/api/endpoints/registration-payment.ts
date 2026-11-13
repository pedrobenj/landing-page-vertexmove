import "server-only"

import { randomUUID } from "node:crypto"

import type { PAYMENT_STATUS } from "@/enums/payment-status.enum"
import { toRegistrationDetails } from "@/lib/utils/to-registration-details"
import type {
  ApiCheckout,
  ApiRegistrationStatus,
  RegistrationDetails,
} from "@/types/api/registration-details.interface"

import { apiFetch } from "../api-client"

// Sem cache: status de pagamento muda a qualquer momento (webhook no backend).

function bearer(accessToken: string): Record<string, string> {
  return { Authorization: `Bearer ${accessToken}` }
}

/** `GET /inscricoes/:codigo` — exige o token da inscrição. */
export async function getRegistrationDetails(codigo: string, accessToken: string): Promise<RegistrationDetails> {
  return toRegistrationDetails(
    await apiFetch<ApiRegistrationStatus>(`/inscricoes/${encodeURIComponent(codigo)}`, { headers: bearer(accessToken) }),
  )
}

/**
 * `POST /inscricoes/:codigo/pagamentos` — cria ou reaproveita a preferência do Checkout Pro.
 * A `Idempotency-Key` é nova a cada clique em "Pagar": o backend já reaproveita a cobrança ativa da inscrição.
 */
export async function createRegistrationCheckout(codigo: string, accessToken: string): Promise<ApiCheckout> {
  return apiFetch(`/inscricoes/${encodeURIComponent(codigo)}/pagamentos`, {
    method: "POST",
    headers: { ...bearer(accessToken), "Idempotency-Key": randomUUID() },
  })
}

/** Só no modo mock: simula o webhook do Mercado Pago. */
export async function simulateMockPayment(codigo: string, resultado: PAYMENT_STATUS): Promise<void> {
  await apiFetch(`/dev/pagamentos/${encodeURIComponent(codigo)}`, { method: "POST", body: { resultado } })
}
