"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { REGISTRATION_STATUS } from "@/enums/registration-status.enum"
import { invalidInputResponse } from "@/lib/utils/invalid-input-response"
import { apiIdSchema } from "@/lib/validations/id.schema"
import {
  cancelAdminRegistration,
  listAdminRegistrations,
  markKitPickup,
  undoKitPickup,
} from "@/server/api/endpoints/admin-registrations"
import { ensureCanManageEvents } from "@/server/api/ensure-can-manage-events"
import { toErrorResponse } from "@/server/api/to-error-response"
import type { ApiAdminRegistration } from "@/types/api/admin-registration.interface"
import type { CursorPage } from "@/types/api/cursor-page.interface"
import type { HttpResponse } from "@/types/http-response.interface"

const LIST_ERROR_TITLE = "Não foi possível carregar as inscrições"
const PICKUP_ERROR_TITLE = "Não foi possível registrar a retirada"
const CANCEL_ERROR_TITLE = "Não foi possível cancelar a inscrição"

const listSchema = z.object({
  eventId: apiIdSchema,
  status: z.union([z.enum(REGISTRATION_STATUS), z.literal("todos")]),
  distanciaId: apiIdSchema.nullable(),
  busca: z.string().trim().max(100),
  cursor: z.string().min(1).max(200).nullable(),
})
const pickupSchema = z.object({ id: apiIdSchema, eventId: apiIdSchema, pickedUp: z.boolean() })
const cancelSchema = z.object({ id: apiIdSchema, eventId: apiIdSchema })

export type ListAdminRegistrationsInput = z.input<typeof listSchema>

function revalidateRegistration(eventId: number, id: number) {
  revalidatePath(`/admin/eventos/${eventId}/inscricoes`)
  revalidatePath(`/admin/eventos/${eventId}/inscricoes/${id}`)
}

/** Página da lista de inscritos (filtros e cursor vêm do Zustand). Filtros vazios não vão à API. */
export async function listAdminRegistrationsAction(input: ListAdminRegistrationsInput): Promise<HttpResponse<CursorPage<ApiAdminRegistration>>> {
  const parsed = listSchema.safeParse(input)
  if (!parsed.success) return invalidInputResponse(LIST_ERROR_TITLE)
  const { eventId, status, distanciaId, busca, cursor } = parsed.data
  try {
    const data = await listAdminRegistrations(eventId, {
      status: status === "todos" ? undefined : status,
      distanciaId: distanciaId ?? undefined,
      busca: busca || undefined,
      cursor: cursor ?? undefined,
    })
    return { status: 200, data }
  } catch (error) {
    return toErrorResponse(error, { title: LIST_ERROR_TITLE, context: "listAdminRegistrationsAction" })
  }
}

/** Marca (`pickedUp: true`) ou desfaz a retirada do kit. A API só aceita inscrição confirmada (409). */
export async function setKitPickupAction(input: z.input<typeof pickupSchema>): Promise<HttpResponse> {
  const denied = await ensureCanManageEvents(PICKUP_ERROR_TITLE, "setKitPickupAction")
  if (denied) return denied
  const parsed = pickupSchema.safeParse(input)
  if (!parsed.success) return invalidInputResponse(PICKUP_ERROR_TITLE)
  const { id, eventId, pickedUp } = parsed.data
  try {
    await (pickedUp ? markKitPickup(id) : undoKitPickup(id))
    revalidateRegistration(eventId, id)
    return { status: 204 }
  } catch (error) {
    return toErrorResponse(error, { title: PICKUP_ERROR_TITLE, context: "setKitPickupAction" })
  }
}

/**
 * Cancela a inscrição (decisão D6: confirmação dupla na UI). Com pagamento aprovado, o backend sinaliza o
 * estorno, que entra na fila de pagamentos: revalida também `/admin/pagamentos`.
 */
export async function cancelAdminRegistrationAction(input: z.input<typeof cancelSchema>): Promise<HttpResponse> {
  const denied = await ensureCanManageEvents(CANCEL_ERROR_TITLE, "cancelAdminRegistrationAction")
  if (denied) return denied
  const parsed = cancelSchema.safeParse(input)
  if (!parsed.success) return invalidInputResponse(CANCEL_ERROR_TITLE)
  const { id, eventId } = parsed.data
  try {
    await cancelAdminRegistration(id)
    revalidateRegistration(eventId, id)
    revalidatePath("/admin/pagamentos")
    return { status: 204 }
  } catch (error) {
    return toErrorResponse(error, { title: CANCEL_ERROR_TITLE, context: "cancelAdminRegistrationAction" })
  }
}
