import "server-only"

import type { Distance, DistanceInput } from "@/types/api/distance.interface"

import { adminFetch } from "../admin-fetch"

/** `GET /admin/eventos/:eventoId/distancias` (array simples) */
export async function listDistances(eventId: number): Promise<Distance[]> {
  return adminFetch(`/admin/eventos/${eventId}/distancias`)
}

/** `POST /admin/eventos/:eventoId/distancias` (201) */
export async function createDistance(eventId: number, input: DistanceInput): Promise<Distance> {
  return adminFetch(`/admin/eventos/${eventId}/distancias`, { method: "POST", body: input })
}

/** `PATCH /admin/distancias/:id` */
export async function updateDistance(id: number, input: Partial<DistanceInput>): Promise<Distance> {
  return adminFetch(`/admin/distancias/${id}`, { method: "PATCH", body: input })
}
