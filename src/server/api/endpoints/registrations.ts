import "server-only"

import type { CursorPage } from "@/types/api/cursor-page.interface"
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

/** `POST /inscricoes/comprovante` — referência da consulta + nascimento (contrato proposto, §16). */
export async function getRegistrationReceipt(input: RegistrationReceiptInput): Promise<RegistrationReceipt> {
  return apiFetch("/inscricoes/comprovante", { method: "POST", body: input })
}
