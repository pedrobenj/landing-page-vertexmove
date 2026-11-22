import "server-only"

import type { REGISTRATION_STATUS } from "@/enums/registration-status.enum"
import type { ApiAdminRegistration, ApiAdminRegistrationDetails } from "@/types/api/admin-registration.interface"
import type { CursorPage } from "@/types/api/cursor-page.interface"

import { adminFetch, adminFetchStream } from "../admin-fetch"

// Inscrições no admin (Bearer, `AdminAuthGuard`). Sem cache: status, pagamento e retirada mudam o tempo todo.

export interface AdminRegistrationsQuery {
  status?: REGISTRATION_STATUS
  distanciaId?: number
  busca?: string
  cursor?: string
  limit?: number
}

/** `GET /admin/eventos/:eventoId/inscricoes?status&distanciaId&busca&cursor&limit` — CPF mascarado, sem contato. */
export async function listAdminRegistrations(eventId: number, query: AdminRegistrationsQuery = {}): Promise<CursorPage<ApiAdminRegistration>> {
  const { status, distanciaId, busca, cursor, limit } = query
  return adminFetch(`/admin/eventos/${eventId}/inscricoes`, { query: { status, distanciaId, busca, cursor, limit } })
}

/** `GET /admin/inscricoes/:id` — com contato e nascimento (o backend registra o acesso a PII). */
export async function getAdminRegistration(id: number): Promise<ApiAdminRegistrationDetails> {
  return adminFetch(`/admin/inscricoes/${id}`)
}

/** `POST /admin/inscricoes/:id/retirada-kit` (204, idempotente). Só inscrição confirmada → senão 409. */
export async function markKitPickup(id: number): Promise<void> {
  await adminFetch<void>(`/admin/inscricoes/${id}/retirada-kit`, { method: "POST" })
}

/** `DELETE /admin/inscricoes/:id/retirada-kit` (204): desfaz a retirada. */
export async function undoKitPickup(id: number): Promise<void> {
  await adminFetch<void>(`/admin/inscricoes/${id}/retirada-kit`, { method: "DELETE" })
}

/** `POST /admin/inscricoes/:id/cancelar` (204). Com pagamento aprovado, o backend sinaliza o estorno. */
export async function cancelAdminRegistration(id: number): Promise<void> {
  await adminFetch<void>(`/admin/inscricoes/${id}/cancelar`, { method: "POST" })
}

/** `GET /admin/eventos/:eventoId/inscricoes.csv` — `Response` em streaming (o route handler repassa ao navegador). */
export async function streamAdminRegistrationsCsv(eventId: number): Promise<Response> {
  return adminFetchStream(`/admin/eventos/${eventId}/inscricoes.csv`, { accept: "text/csv" })
}
