import "server-only"

import type { LgpdRequestInput, LgpdRequestReceipt } from "@/types/api/lgpd-request.interface"

import { apiFetch } from "../api-client"

/**
 * `POST /lgpd/solicitacoes` (público, 202): a mesma resposta exista ou não o titular. IP/User-Agent do
 * titular seguem para o rate limit do backend (`apiFetch`).
 */
export async function createLgpdRequest(input: LgpdRequestInput): Promise<LgpdRequestReceipt> {
  return apiFetch("/lgpd/solicitacoes", { method: "POST", body: input })
}
