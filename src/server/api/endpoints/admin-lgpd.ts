import "server-only"

import type { CursorPage } from "@/types/api/cursor-page.interface"
import type {
  AdminLgpdRequest,
  AdminLgpdRequestFilters,
  AdminLgpdRequestStatus,
  AdminLgpdRequestSummary,
  LgpdAnonymizationResult,
  LgpdRequestStatusInput,
} from "@/types/api/lgpd-request.interface"

import { adminFetch, adminFetchStream } from "../admin-fetch"

const BASE = "/admin/lgpd/solicitacoes"

/** `GET /admin/lgpd/solicitacoes?status&tipo&cursor&limit`: mais recentes primeiro, sem PII. */
export async function listAdminLgpdRequests(filters: AdminLgpdRequestFilters = {}): Promise<CursorPage<AdminLgpdRequestSummary>> {
  const { status, tipo, cursor } = filters
  return adminFetch(BASE, { query: { status, tipo, cursor } })
}

/** `GET /admin/lgpd/solicitacoes/:id`: dados do requerente, CPF mascarado (o backend audita o acesso). */
export async function getAdminLgpdRequest(id: number): Promise<AdminLgpdRequest> {
  return adminFetch(`${BASE}/${id}`)
}

/** `PATCH /admin/lgpd/solicitacoes/:id`: concluída/recusada exigem a resposta; finais não mudam (409). */
export async function updateLgpdRequestStatus(id: number, input: LgpdRequestStatusInput): Promise<AdminLgpdRequestStatus> {
  return adminFetch(`${BASE}/${id}`, { method: "PATCH", body: input })
}

/** `POST /admin/lgpd/solicitacoes/:id/exportar`: JSON do titular, repassado em streaming (auditado). */
export async function streamLgpdExport(id: number): Promise<Response> {
  return adminFetchStream(`${BASE}/${id}/exportar`, { accept: "application/json", method: "POST" })
}

/** `POST /admin/lgpd/solicitacoes/:id/anonimizar` com `{ confirmar: true }`. Irreversível e idempotente. */
export async function anonymizeLgpdHolder(id: number): Promise<LgpdAnonymizationResult> {
  return adminFetch(`${BASE}/${id}/anonimizar`, { method: "POST", body: { confirmar: true } })
}
