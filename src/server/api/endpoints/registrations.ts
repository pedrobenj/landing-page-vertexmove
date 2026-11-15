import "server-only"

import { randomUUID } from "node:crypto"

import type { CursorPage } from "@/types/api/cursor-page.interface"
import type { ApiCheckout } from "@/types/api/registration-details.interface"
import type { RegistrationReceipt, RegistrationReceiptInput } from "@/types/api/registration-receipt.interface"
import type {
  CreatedRegistration,
  CreateRegistrationInput,
  RegistrationLookupInput,
  RegistrationLookupItem,
} from "@/types/api/registration.interface"

import { apiFetch } from "../api-client"

// Sem cache: respostas sensíveis. IP/User-Agent do atleta repassados para o rate limit do backend.

/** `POST /inscricoes` */
export async function createRegistration(input: CreateRegistrationInput): Promise<CreatedRegistration> {
  return apiFetch("/inscricoes", { method: "POST", body: input })
}

/** `POST /inscricoes/consulta` — exatamente um de `cpf`/`whatsapp`. */
export async function lookupRegistrations(
  input: RegistrationLookupInput,
  cursor?: string,
): Promise<CursorPage<RegistrationLookupItem>> {
  return apiFetch("/inscricoes/consulta", { method: "POST", body: input, query: { cursor } })
}

/** `POST /inscricoes/comprovante` — referência da consulta + nascimento (rate limit no backend). */
export async function getRegistrationReceipt(input: RegistrationReceiptInput): Promise<RegistrationReceipt> {
  return apiFetch("/inscricoes/comprovante", { method: "POST", body: input })
}

/**
 * `POST /inscricoes/comprovante/pagamento` — checkout sem o token da inscrição (outro aparelho): mesma
 * referência + nascimento do comprovante. Idempotency-Key nova a cada clique; o backend reaproveita a
 * cobrança ativa.
 */
export async function createReceiptCheckout(input: RegistrationReceiptInput): Promise<ApiCheckout> {
  return apiFetch("/inscricoes/comprovante/pagamento", {
    method: "POST",
    body: input,
    headers: { "Idempotency-Key": randomUUID() },
  })
}
