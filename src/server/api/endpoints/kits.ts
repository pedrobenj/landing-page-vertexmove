import "server-only"

import type { Kit, KitInput } from "@/types/api/kit.interface"

import { adminFetch } from "../admin-fetch"

/** `GET /admin/eventos/:eventoId/kits` (array simples) */
export async function listKits(eventId: number): Promise<Kit[]> {
  return adminFetch(`/admin/eventos/${eventId}/kits`)
}

/** `POST /admin/eventos/:eventoId/kits` (201) */
export async function createKit(eventId: number, input: KitInput): Promise<Kit> {
  return adminFetch(`/admin/eventos/${eventId}/kits`, { method: "POST", body: input })
}

/** `PATCH /admin/kits/:id` */
export async function updateKit(id: number, input: Partial<KitInput>): Promise<Kit> {
  return adminFetch(`/admin/kits/${id}`, { method: "PATCH", body: input })
}
