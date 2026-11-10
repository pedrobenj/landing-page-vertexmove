import "server-only"

import type { PAYMENT_STATUS } from "@/enums/payment-status.enum"
import type { RegistrationCheckout, RegistrationDetails } from "@/types/api/registration-details.interface"

import { apiFetch } from "../api-client"

// Sem cache: status de pagamento muda a qualquer momento (webhook no backend).

/** `GET /inscricoes/:codigo` — proposto ao backend (§16). */
export async function getRegistrationDetails(codigo: string): Promise<RegistrationDetails> {
  return apiFetch(`/inscricoes/${encodeURIComponent(codigo)}`)
}

/** `POST /inscricoes/:codigo/pagamento` — cria a preferência do Checkout Pro no backend (§7). */
export async function createRegistrationCheckout(codigo: string): Promise<RegistrationCheckout> {
  return apiFetch(`/inscricoes/${encodeURIComponent(codigo)}/pagamento`, { method: "POST" })
}

/** Só no modo mock: simula o webhook do Mercado Pago. */
export async function simulateMockPayment(codigo: string, resultado: PAYMENT_STATUS): Promise<void> {
  await apiFetch(`/dev/pagamentos/${encodeURIComponent(codigo)}`, { method: "POST", body: { resultado } })
}
