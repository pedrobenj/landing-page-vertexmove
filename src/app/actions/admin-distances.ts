"use server"

import { invalidInputResponse } from "@/lib/utils/invalid-input-response"
import { distanceFormSchema, type DistanceFormInput } from "@/lib/validations/distance.schema"
import { apiIdSchema } from "@/lib/validations/id.schema"
import { priceTierFormSchema, type PriceTierFormInput } from "@/lib/validations/price-tier.schema"
import { assertDistanceInEvent, assertPriceTierInDistance } from "@/server/api/catalog-ownership"
import { getAdminEvent } from "@/server/api/endpoints/admin-events"
import { createDistance, updateDistance } from "@/server/api/endpoints/distances"
import { createPriceTier, updatePriceTier } from "@/server/api/endpoints/price-tiers"
import { ensureCanManageEvents } from "@/server/api/ensure-can-manage-events"
import { revalidateEventTags } from "@/server/api/revalidate-event-tags"
import { toErrorResponse } from "@/server/api/to-error-response"
import type { Distance } from "@/types/api/distance.interface"
import type { PriceTier } from "@/types/api/price-tier.interface"
import type { HttpResponse } from "@/types/http-response.interface"

const DISTANCE_ERROR_TITLE = "Não foi possível salvar a distância"
const PRICE_TIER_ERROR_TITLE = "Não foi possível salvar o lote"

/*
 * O slug para revalidar a página pública vem do servidor (`GET /admin/eventos/:id`), não do client.
 * Distâncias e lotes mudam preço e vagas exibidos no site: toda mutação revalida `event:<slug>`.
 */

/** `POST /admin/eventos/:eventoId/distancias` */
export async function createDistanceAction(eventId: number, input: DistanceFormInput): Promise<HttpResponse<Distance>> {
  const denied = await ensureCanManageEvents(DISTANCE_ERROR_TITLE, "createDistanceAction")
  if (denied) return denied

  const parsedEventId = apiIdSchema.safeParse(eventId)
  if (!parsedEventId.success) return invalidInputResponse(DISTANCE_ERROR_TITLE)
  const parsed = distanceFormSchema.safeParse(input)
  if (!parsed.success) return invalidInputResponse(DISTANCE_ERROR_TITLE, parsed.error.issues[0])

  try {
    const event = await getAdminEvent(parsedEventId.data)
    const data = await createDistance(event.id, parsed.data)
    revalidateEventTags(event.slug)
    return { status: 201, data, title: "Distância cadastrada" }
  } catch (error) {
    return toErrorResponse(error, { title: DISTANCE_ERROR_TITLE, context: "createDistanceAction" })
  }
}

/** `PATCH /admin/distancias/:id` (confere que a distância é da corrida). */
export async function updateDistanceAction(
  eventId: number,
  distanceId: number,
  input: DistanceFormInput,
): Promise<HttpResponse<Distance>> {
  const denied = await ensureCanManageEvents(DISTANCE_ERROR_TITLE, "updateDistanceAction")
  if (denied) return denied

  const parsedEventId = apiIdSchema.safeParse(eventId)
  const parsedDistanceId = apiIdSchema.safeParse(distanceId)
  if (!parsedEventId.success || !parsedDistanceId.success) return invalidInputResponse(DISTANCE_ERROR_TITLE)
  const parsed = distanceFormSchema.safeParse(input)
  if (!parsed.success) return invalidInputResponse(DISTANCE_ERROR_TITLE, parsed.error.issues[0])

  try {
    const event = await getAdminEvent(parsedEventId.data)
    await assertDistanceInEvent(event.id, parsedDistanceId.data)
    const data = await updateDistance(parsedDistanceId.data, parsed.data)
    revalidateEventTags(event.slug)
    return { status: 200, data, title: "Distância atualizada" }
  } catch (error) {
    return toErrorResponse(error, { title: DISTANCE_ERROR_TITLE, context: "updateDistanceAction" })
  }
}

/** `POST /admin/distancias/:distanciaId/lotes` (confere que a distância é da corrida). */
export async function createPriceTierAction(
  eventId: number,
  distanceId: number,
  input: PriceTierFormInput,
): Promise<HttpResponse<PriceTier>> {
  const denied = await ensureCanManageEvents(PRICE_TIER_ERROR_TITLE, "createPriceTierAction")
  if (denied) return denied

  const parsedEventId = apiIdSchema.safeParse(eventId)
  const parsedDistanceId = apiIdSchema.safeParse(distanceId)
  if (!parsedEventId.success || !parsedDistanceId.success) return invalidInputResponse(PRICE_TIER_ERROR_TITLE)
  const parsed = priceTierFormSchema.safeParse(input)
  if (!parsed.success) return invalidInputResponse(PRICE_TIER_ERROR_TITLE, parsed.error.issues[0])

  try {
    const event = await getAdminEvent(parsedEventId.data)
    await assertDistanceInEvent(event.id, parsedDistanceId.data)
    const data = await createPriceTier(parsedDistanceId.data, parsed.data)
    revalidateEventTags(event.slug)
    return { status: 201, data, title: "Lote cadastrado" }
  } catch (error) {
    return toErrorResponse(error, { title: PRICE_TIER_ERROR_TITLE, context: "createPriceTierAction" })
  }
}

/** `PATCH /admin/lotes/:id` (confere distância → corrida e lote → distância). */
export async function updatePriceTierAction(
  eventId: number,
  distanceId: number,
  priceTierId: number,
  input: PriceTierFormInput,
): Promise<HttpResponse<PriceTier>> {
  const denied = await ensureCanManageEvents(PRICE_TIER_ERROR_TITLE, "updatePriceTierAction")
  if (denied) return denied

  const ids = [eventId, distanceId, priceTierId].map((id) => apiIdSchema.safeParse(id))
  if (ids.some((id) => !id.success)) return invalidInputResponse(PRICE_TIER_ERROR_TITLE)
  const parsed = priceTierFormSchema.safeParse(input)
  if (!parsed.success) return invalidInputResponse(PRICE_TIER_ERROR_TITLE, parsed.error.issues[0])

  try {
    const event = await getAdminEvent(eventId)
    await assertDistanceInEvent(event.id, distanceId)
    await assertPriceTierInDistance(distanceId, priceTierId)
    const data = await updatePriceTier(priceTierId, parsed.data)
    revalidateEventTags(event.slug)
    return { status: 200, data, title: "Lote atualizado" }
  } catch (error) {
    return toErrorResponse(error, { title: PRICE_TIER_ERROR_TITLE, context: "updatePriceTierAction" })
  }
}
