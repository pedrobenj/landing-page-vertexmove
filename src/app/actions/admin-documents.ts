"use server"

import { invalidInputResponse } from "@/lib/utils/invalid-input-response"
import { documentFormSchema, type DocumentFormInput } from "@/lib/validations/document.schema"
import { apiIdSchema } from "@/lib/validations/id.schema"
import { getAdminEvent } from "@/server/api/endpoints/admin-events"
import { createDocument } from "@/server/api/endpoints/documents"
import { ensureCanManageEvents } from "@/server/api/ensure-can-manage-events"
import { revalidateEventTags } from "@/server/api/revalidate-event-tags"
import { toErrorResponse } from "@/server/api/to-error-response"
import type { EventDocument } from "@/types/api/document.interface"
import type { HttpResponse } from "@/types/http-response.interface"

const DOCUMENT_ERROR_TITLE = "Não foi possível publicar a nova versão"

/**
 * `POST /admin/documentos` — nova versão (documentos são imutáveis). O `eventoId` vem da corrida lida no
 * servidor; a página pública lista os documentos vigentes, então revalida `event:<slug>`.
 */
export async function createDocumentAction(eventId: number, input: DocumentFormInput): Promise<HttpResponse<EventDocument>> {
  const denied = await ensureCanManageEvents(DOCUMENT_ERROR_TITLE, "createDocumentAction")
  if (denied) return denied

  const parsedEventId = apiIdSchema.safeParse(eventId)
  if (!parsedEventId.success) return invalidInputResponse(DOCUMENT_ERROR_TITLE)
  const parsed = documentFormSchema.safeParse(input)
  if (!parsed.success) return invalidInputResponse(DOCUMENT_ERROR_TITLE, parsed.error.issues[0])

  try {
    const event = await getAdminEvent(parsedEventId.data)
    const data = await createDocument({ ...parsed.data, eventoId: event.id })
    revalidateEventTags(event.slug, { includeList: false })
    return { status: 201, data, title: "Nova versão publicada" }
  } catch (error) {
    return toErrorResponse(error, { title: DOCUMENT_ERROR_TITLE, context: "createDocumentAction" })
  }
}
