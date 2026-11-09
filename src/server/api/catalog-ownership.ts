import "server-only"

import { API_ERROR_CODE } from "@/enums/api-error-code.enum"

import { ApiError } from "./api-error"
import { listDistances } from "./endpoints/distances"
import { listKits } from "./endpoints/kits"
import { listPriceTiers } from "./endpoints/price-tiers"

/**
 * As rotas de PATCH da API (`/admin/distancias/:id`, `/admin/lotes/:id`, `/admin/kits/:id`) não levam o
 * evento: o front confere no servidor que o item pertence à corrida da página antes de alterar e de
 * revalidar `event:<slug>` — não confia nos ids vindos do client. Item de outra corrida → 404.
 */
function notFound(entity: string): ApiError {
  return new ApiError(404, API_ERROR_CODE.NOT_FOUND, `${entity} não encontrado(a) nesta corrida.`)
}

export async function assertDistanceInEvent(eventId: number, distanceId: number): Promise<void> {
  const distances = await listDistances(eventId)
  if (!distances.some((distance) => distance.id === distanceId)) throw notFound("Distância")
}

export async function assertPriceTierInDistance(distanceId: number, priceTierId: number): Promise<void> {
  const tiers = await listPriceTiers(distanceId)
  if (!tiers.some((tier) => tier.id === priceTierId)) throw notFound("Lote")
}

export async function assertKitInEvent(eventId: number, kitId: number): Promise<void> {
  const kits = await listKits(eventId)
  if (!kits.some((kit) => kit.id === kitId)) throw notFound("Kit")
}
