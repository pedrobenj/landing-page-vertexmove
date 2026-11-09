import "server-only"

import type { EVENT_ACTION } from "@/enums/event-action.enum"
import type { EVENT_STATUS } from "@/enums/event-status.enum"
import type { AdminEvent, AdminEventInput } from "@/types/api/admin-event.interface"
import type { CursorPage } from "@/types/api/cursor-page.interface"

import { adminFetch } from "../admin-fetch"

export interface AdminEventsQuery {
  status?: EVENT_STATUS
  cursor?: string
  limit?: number
}

/** `GET /admin/eventos?status&cursor&limit` */
export async function listAdminEvents({ status, cursor, limit }: AdminEventsQuery = {}): Promise<CursorPage<AdminEvent>> {
  return adminFetch("/admin/eventos", { query: { status, cursor, limit } })
}

/** `GET /admin/eventos/:id` */
export async function getAdminEvent(id: number): Promise<AdminEvent> {
  return adminFetch(`/admin/eventos/${id}`)
}

/** `POST /admin/eventos` (201, nasce em rascunho) */
export async function createAdminEvent(input: AdminEventInput): Promise<AdminEvent> {
  return adminFetch("/admin/eventos", { method: "POST", body: input })
}

/** `PATCH /admin/eventos/:id` */
export async function updateAdminEvent(id: number, input: Partial<AdminEventInput>): Promise<AdminEvent> {
  return adminFetch(`/admin/eventos/${id}`, { method: "PATCH", body: input })
}

/** `DELETE /admin/eventos/:id` (204, soft delete) */
export async function deleteAdminEvent(id: number): Promise<void> {
  await adminFetch<void>(`/admin/eventos/${id}`, { method: "DELETE" })
}

/** `POST /admin/eventos/:id/<acao>` (204) — publicar, despublicar, encerrar, cancelar, restaurar. */
export async function runEventAction(id: number, action: EVENT_ACTION): Promise<void> {
  await adminFetch<void>(`/admin/eventos/${id}/${action}`, { method: "POST" })
}
