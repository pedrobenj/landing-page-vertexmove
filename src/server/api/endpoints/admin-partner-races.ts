import "server-only"

import type { AdminPartnerRace, PartnerRaceInput } from "@/types/api/partner-race.interface"

import { adminFetch } from "../admin-fetch"

const BASE = "/admin/corridas-parceiras"

/** `GET /admin/corridas-parceiras`: todas (inclusive inativas e passadas), data ↓. Array simples. */
export async function listAdminPartnerRaces(): Promise<AdminPartnerRace[]> {
  return adminFetch(BASE)
}

/** `GET /admin/corridas-parceiras/:id` (404 se não existe). */
export async function getAdminPartnerRace(id: number): Promise<AdminPartnerRace> {
  return adminFetch(`${BASE}/${id}`)
}

/** `POST /admin/corridas-parceiras` (201). */
export async function createPartnerRace(input: PartnerRaceInput): Promise<AdminPartnerRace> {
  return adminFetch(BASE, { method: "POST", body: input })
}

/** `PATCH /admin/corridas-parceiras/:id` (subconjunto não vazio). */
export async function updatePartnerRace(id: number, input: Partial<PartnerRaceInput>): Promise<AdminPartnerRace> {
  return adminFetch(`${BASE}/${id}`, { method: "PATCH", body: input })
}

/** `DELETE /admin/corridas-parceiras/:id` (204, exclusão física). */
export async function deletePartnerRace(id: number): Promise<void> {
  await adminFetch(`${BASE}/${id}`, { method: "DELETE" })
}
