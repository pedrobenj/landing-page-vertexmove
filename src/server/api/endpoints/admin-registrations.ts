import "server-only"

import type { REGISTRATION_STATUS } from "@/enums/registration-status.enum"
import type {
  ApiAdminRegistration,
  ApiAdminRegistrationDetails,
  ApiCancelledRegistration,
  ApiKitPickup,
} from "@/types/api/admin-registration.interface"
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

/**
 * `GET /admin/eventos/:eventoId/inscricoes?status&distanciaId&busca&cursor&limit` — sem contato (não grava
 * acesso a PII). `busca`: código `VX-AAAA-NNNNNNNN` exato ou trecho do nome.
 */
export async function listAdminRegistrations(eventId: number, query: AdminRegistrationsQuery = {}): Promise<CursorPage<ApiAdminRegistration>> {
  const { status, distanciaId, busca, cursor, limit } = query
  return adminFetch(`/admin/eventos/${eventId}/inscricoes`, { query: { status, distanciaId, busca, cursor, limit } })
}

/** `GET /admin/inscricoes/:id` — com contato e nascimento (o backend registra o acesso a PII). */
export async function getAdminRegistration(id: number): Promise<ApiAdminRegistrationDetails> {
  return adminFetch(`/admin/inscricoes/${id}`)
}

/** `POST /admin/inscricoes/:id/retirada-kit` (200, idempotente: repetir devolve o mesmo instante). Só confirmada → senão 409. */
export async function markKitPickup(id: number): Promise<ApiKitPickup> {
  return adminFetch(`/admin/inscricoes/${id}/retirada-kit`, { method: "POST" })
}

/** `DELETE /admin/inscricoes/:id/retirada-kit` (204): desfaz a retirada. */
export async function undoKitPickup(id: number): Promise<void> {
  await adminFetch<void>(`/admin/inscricoes/${id}/retirada-kit`, { method: "DELETE" })
}

/**
 * `POST /admin/inscricoes/:id/cancelar` com `{ motivo }` (1–500, obrigatório) → 200. Confirmada com pagamento
 * aprovado: o estorno é sinalizado (`estornoSinalizado`). Já cancelada → 200 idempotente; expirada/estornada → 409.
 */
export async function cancelAdminRegistration(id: number, motivo: string): Promise<ApiCancelledRegistration> {
  return adminFetch(`/admin/inscricoes/${id}/cancelar`, { method: "POST", body: { motivo } })
}

/**
 * `GET /admin/eventos/:eventoId/inscricoes.csv?status&distanciaId` — `Response` em streaming (o route handler
 * repassa ao navegador sem bufferizar). Erros antes do primeiro byte vêm em JSON (viram `ApiError`).
 */
export async function streamAdminRegistrationsCsv(
  eventId: number,
  filters: { status?: REGISTRATION_STATUS; distanciaId?: number } = {},
): Promise<Response> {
  return adminFetchStream(`/admin/eventos/${eventId}/inscricoes.csv`, {
    accept: "text/csv",
    query: { status: filters.status, distanciaId: filters.distanciaId },
  })
}
