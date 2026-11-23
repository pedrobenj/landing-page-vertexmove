import "server-only"

import type { CursorPage } from "@/types/api/cursor-page.interface"
import type {
  AdminLgpdRequest,
  AdminLgpdRequestFilters,
  AdminLgpdRequestSummary,
  LgpdRequestStatusInput,
} from "@/types/api/lgpd-request.interface"

import { adminFetch, adminFetchStream } from "../admin-fetch"

const BASE = "/admin/lgpd/solicitacoes"

/** `GET /admin/lgpd/solicitacoes?status&tipo&cursor&limit`: mais recentes primeiro, sem PII. */
export async function listAdminLgpdRequests(filters: AdminLgpdRequestFilters = {}): Promise<CursorPage<AdminLgpdRequestSummary>> {
  const { status, tipo, cursor } = filters
  return adminFetch(BASE, { query: { status, tipo, cursor } })
}

/** `GET /admin/lgpd/solicitacoes/:id`: com os dados pessoais (o backend audita o acesso). */
export async function getAdminLgpdRequest(id: number): Promise<AdminLgpdRequest> {
  return adminFetch(`${BASE}/${id}`)
}

/** `POST /admin/lgpd/solicitacoes/:id/status`: concluída/recusada exigem a resposta ao titular. */
export async function updateLgpdRequestStatus(id: number, input: LgpdRequestStatusInput): Promise<AdminLgpdRequest> {
  return adminFetch(`${BASE}/${id}/status`, { method: "POST", body: input })
}

/** `GET /admin/lgpd/solicitacoes/:id/exportacao`: JSON do titular, repassado em streaming (auditado). */
export async function streamLgpdExport(id: number): Promise<Response> {
  return adminFetchStream(`${BASE}/${id}/exportacao`, { accept: "application/json" })
}

/** `POST /admin/lgpd/solicitacoes/:id/anonimizar` (204). Irreversível. */
export async function anonymizeLgpdHolder(id: number): Promise<void> {
  await adminFetch(`${BASE}/${id}/anonimizar`, { method: "POST" })
}
