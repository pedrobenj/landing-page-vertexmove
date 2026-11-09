"use server"

import { invalidInputResponse } from "@/lib/utils/invalid-input-response"
import { apiIdSchema } from "@/lib/validations/id.schema"
import { kitFormSchema, type KitFormInput } from "@/lib/validations/kit.schema"
import { assertKitInEvent } from "@/server/api/catalog-ownership"
import { getAdminEvent } from "@/server/api/endpoints/admin-events"
import { createKit, updateKit } from "@/server/api/endpoints/kits"
import { ensureCanManageEvents } from "@/server/api/ensure-can-manage-events"
import { revalidateEventTags } from "@/server/api/revalidate-event-tags"
import { toErrorResponse } from "@/server/api/to-error-response"
import type { Kit } from "@/types/api/kit.interface"
import type { HttpResponse } from "@/types/http-response.interface"

const KIT_ERROR_TITLE = "Não foi possível salvar o kit"

/** `POST /admin/eventos/:eventoId/kits`. Os kits aparecem na página pública: revalida `event:<slug>`. */
export async function createKitAction(eventId: number, input: KitFormInput): Promise<HttpResponse<Kit>> {
  const denied = await ensureCanManageEvents(KIT_ERROR_TITLE, "createKitAction")
  if (denied) return denied

  const parsedEventId = apiIdSchema.safeParse(eventId)
  if (!parsedEventId.success) return invalidInputResponse(KIT_ERROR_TITLE)
  const parsed = kitFormSchema.safeParse(input)
  if (!parsed.success) return invalidInputResponse(KIT_ERROR_TITLE, parsed.error.issues[0])

  try {
    const event = await getAdminEvent(parsedEventId.data)
    const data = await createKit(event.id, parsed.data)
    revalidateEventTags(event.slug)
    return { status: 201, data, title: "Kit cadastrado" }
  } catch (error) {
    return toErrorResponse(error, { title: KIT_ERROR_TITLE, context: "createKitAction" })
  }
}

/** `PATCH /admin/kits/:id` (confere que o kit é da corrida; as fotos são substituídas pela lista enviada). */
export async function updateKitAction(eventId: number, kitId: number, input: KitFormInput): Promise<HttpResponse<Kit>> {
  const denied = await ensureCanManageEvents(KIT_ERROR_TITLE, "updateKitAction")
  if (denied) return denied

  const parsedEventId = apiIdSchema.safeParse(eventId)
  const parsedKitId = apiIdSchema.safeParse(kitId)
  if (!parsedEventId.success || !parsedKitId.success) return invalidInputResponse(KIT_ERROR_TITLE)
  const parsed = kitFormSchema.safeParse(input)
  if (!parsed.success) return invalidInputResponse(KIT_ERROR_TITLE, parsed.error.issues[0])

  try {
    const event = await getAdminEvent(parsedEventId.data)
    await assertKitInEvent(event.id, parsedKitId.data)
    const data = await updateKit(parsedKitId.data, parsed.data)
    revalidateEventTags(event.slug)
    return { status: 200, data, title: "Kit atualizado" }
  } catch (error) {
    return toErrorResponse(error, { title: KIT_ERROR_TITLE, context: "updateKitAction" })
  }
}
