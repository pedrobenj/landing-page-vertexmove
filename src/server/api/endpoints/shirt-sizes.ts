import "server-only"

import type { ShirtSize, ShirtSizeInput } from "@/types/api/shirt-size.interface"

import { adminFetch } from "../admin-fetch"

/** `GET /admin/tamanhos-camisa` (catálogo global, array simples) */
export async function listShirtSizes(): Promise<ShirtSize[]> {
  return adminFetch("/admin/tamanhos-camisa")
}

/** `POST /admin/tamanhos-camisa` (201) */
export async function createShirtSize(input: ShirtSizeInput): Promise<ShirtSize> {
  return adminFetch("/admin/tamanhos-camisa", { method: "POST", body: input })
}

/** `PATCH /admin/tamanhos-camisa/:id` */
export async function updateShirtSize(id: number, input: Partial<ShirtSizeInput>): Promise<ShirtSize> {
  return adminFetch(`/admin/tamanhos-camisa/${id}`, { method: "PATCH", body: input })
}
