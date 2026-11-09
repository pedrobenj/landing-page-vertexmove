import "server-only"

import type { PriceTier, PriceTierInput } from "@/types/api/price-tier.interface"

import { adminFetch } from "../admin-fetch"

/** `GET /admin/distancias/:distanciaId/lotes` (array simples) */
export async function listPriceTiers(distanceId: number): Promise<PriceTier[]> {
  return adminFetch(`/admin/distancias/${distanceId}/lotes`)
}

/** `POST /admin/distancias/:distanciaId/lotes` (201) */
export async function createPriceTier(distanceId: number, input: PriceTierInput): Promise<PriceTier> {
  return adminFetch(`/admin/distancias/${distanceId}/lotes`, { method: "POST", body: input })
}

/** `PATCH /admin/lotes/:id` */
export async function updatePriceTier(id: number, input: Partial<PriceTierInput>): Promise<PriceTier> {
  return adminFetch(`/admin/lotes/${id}`, { method: "PATCH", body: input })
}
