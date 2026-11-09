"use server"

import { invalidInputResponse } from "@/lib/utils/invalid-input-response"
import { apiIdSchema } from "@/lib/validations/id.schema"
import { shirtSizeFormSchema, type ShirtSizeFormInput } from "@/lib/validations/shirt-size.schema"
import { createShirtSize, updateShirtSize } from "@/server/api/endpoints/shirt-sizes"
import { ensureCanManageEvents } from "@/server/api/ensure-can-manage-events"
import { revalidateEventTags } from "@/server/api/revalidate-event-tags"
import { toErrorResponse } from "@/server/api/to-error-response"
import type { ShirtSize } from "@/types/api/shirt-size.interface"
import type { HttpResponse } from "@/types/http-response.interface"

const SHIRT_SIZE_ERROR_TITLE = "Não foi possível salvar o tamanho"

/*
 * Catálogo global: os tamanhos aparecem em todas as páginas de corrida, então as mutações revalidam a
 * tag `events` (que também marca cada detalhe público).
 */

/** `POST /admin/tamanhos-camisa` */
export async function createShirtSizeAction(input: ShirtSizeFormInput): Promise<HttpResponse<ShirtSize>> {
  const denied = await ensureCanManageEvents(SHIRT_SIZE_ERROR_TITLE, "createShirtSizeAction")
  if (denied) return denied

  const parsed = shirtSizeFormSchema.safeParse(input)
  if (!parsed.success) return invalidInputResponse(SHIRT_SIZE_ERROR_TITLE, parsed.error.issues[0])

  try {
    const data = await createShirtSize(parsed.data)
    revalidateEventTags()
    return { status: 201, data, title: "Tamanho cadastrado" }
  } catch (error) {
    return toErrorResponse(error, { title: SHIRT_SIZE_ERROR_TITLE, context: "createShirtSizeAction" })
  }
}

/** `PATCH /admin/tamanhos-camisa/:id` */
export async function updateShirtSizeAction(id: number, input: ShirtSizeFormInput): Promise<HttpResponse<ShirtSize>> {
  const denied = await ensureCanManageEvents(SHIRT_SIZE_ERROR_TITLE, "updateShirtSizeAction")
  if (denied) return denied

  const parsedId = apiIdSchema.safeParse(id)
  if (!parsedId.success) return invalidInputResponse(SHIRT_SIZE_ERROR_TITLE)
  const parsed = shirtSizeFormSchema.safeParse(input)
  if (!parsed.success) return invalidInputResponse(SHIRT_SIZE_ERROR_TITLE, parsed.error.issues[0])

  try {
    const data = await updateShirtSize(parsedId.data, parsed.data)
    revalidateEventTags()
    return { status: 200, data, title: "Tamanho atualizado" }
  } catch (error) {
    return toErrorResponse(error, { title: SHIRT_SIZE_ERROR_TITLE, context: "updateShirtSizeAction" })
  }
}
