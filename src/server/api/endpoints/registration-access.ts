import "server-only"

import type {
  MockAccessEmail,
  RegistrationAccessGrant,
  RegistrationAccessLinkInput,
  RegistrationAccessLinkResponse,
} from "@/types/api/registration-access.interface"

import { apiFetch } from "../api-client"

// Sem cache. IP/User-Agent do atleta repassados para o rate limit do backend.

/** `POST /inscricoes/acesso/link` — sempre `202 { mensagem }`, exista ou não inscrição (429 no rate limit). */
export async function requestRegistrationAccessLink(input: RegistrationAccessLinkInput): Promise<RegistrationAccessLinkResponse> {
  return apiFetch("/inscricoes/acesso/link", { method: "POST", body: input })
}

/**
 * `POST /inscricoes/acesso` — troca o token de uso único pelo `accessToken` reemitido (o anterior passa a
 * dar 401). Token inexistente, usado, vencido ou de inscrição inativa → sempre `404 RECURSO_NAO_ENCONTRADO`.
 */
export async function redeemRegistrationAccessToken(token: string): Promise<RegistrationAccessGrant> {
  return apiFetch("/inscricoes/acesso", { method: "POST", body: { token } })
}

/** Só no mock: e-mails "enviados" com o link (`GET /dev/emails`). */
export async function listMockAccessEmails(): Promise<MockAccessEmail[]> {
  return apiFetch("/dev/emails")
}
