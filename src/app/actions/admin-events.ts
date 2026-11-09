"use server"

import { z } from "zod"

import { API_ERROR_CODE } from "@/enums/api-error-code.enum"
import { EVENT_ACTION } from "@/enums/event-action.enum"
import { EVENT_STATUS } from "@/enums/event-status.enum"
import { invalidInputResponse } from "@/lib/utils/invalid-input-response"
import { adminEventFormSchema, type AdminEventFormInput } from "@/lib/validations/admin-event.schema"
import {
  createAdminEvent,
  deleteAdminEvent,
  getAdminEvent,
  listAdminEvents,
  runEventAction,
  updateAdminEvent,
} from "@/server/api/endpoints/admin-events"
import { ensureCanManageEvents } from "@/server/api/ensure-can-manage-events"
import { revalidateEventTags } from "@/server/api/revalidate-event-tags"
import { toErrorResponse } from "@/server/api/to-error-response"
import type { AdminEvent } from "@/types/api/admin-event.interface"
import type { CursorPage } from "@/types/api/cursor-page.interface"
import type { HttpResponse } from "@/types/http-response.interface"

const LIST_ERROR_TITLE = "Não foi possível carregar as corridas"
const SAVE_ERROR_TITLE = "Não foi possível salvar a corrida"
const DELETE_ERROR_TITLE = "Não foi possível excluir a corrida"
const ACTION_ERROR_TITLE = "Não foi possível alterar o status da corrida"

/** Slug duplicado vem como 409 sem campo na mensagem: aponta para o campo `slug`. */
const SAVE_FIELD_BY_CODE = { [API_ERROR_CODE.DUPLICATE_SLUG]: "slug" }

const listAdminEventsSchema = z.object({
  status: z.union([z.enum(EVENT_STATUS), z.literal("todos")]),
  cursor: z.string().min(1).max(200).nullable(),
})
const eventIdSchema = z.number().int().positive()
const eventActionSchema = z.enum(EVENT_ACTION)

export type ListAdminEventsInput = z.input<typeof listAdminEventsSchema>

/** `GET /admin/eventos?status&cursor` (o `adminFetch` exige a sessão). */
export async function listAdminEventsAction(input: ListAdminEventsInput): Promise<HttpResponse<CursorPage<AdminEvent>>> {
  const parsed = listAdminEventsSchema.safeParse(input)
  if (!parsed.success) return invalidInputResponse(LIST_ERROR_TITLE)

  const { status, cursor } = parsed.data
  try {
    const data = await listAdminEvents({ status: status === "todos" ? undefined : status, cursor: cursor ?? undefined })
    return { status: 200, data }
  } catch (error) {
    return toErrorResponse(error, { title: LIST_ERROR_TITLE, context: "listAdminEventsAction" })
  }
}

/** `POST /admin/eventos`: a corrida nasce em rascunho (fora do site, sem revalidação pública). */
export async function createAdminEventAction(input: AdminEventFormInput): Promise<HttpResponse<AdminEvent>> {
  const denied = await ensureCanManageEvents(SAVE_ERROR_TITLE, "createAdminEventAction")
  if (denied) return denied

  const parsed = adminEventFormSchema.safeParse(input)
  if (!parsed.success) return invalidInputResponse(SAVE_ERROR_TITLE, parsed.error.issues[0])

  try {
    const data = await createAdminEvent(parsed.data)
    return { status: 201, data, title: "Corrida cadastrada como rascunho" }
  } catch (error) {
    return toErrorResponse(error, { title: SAVE_ERROR_TITLE, context: "createAdminEventAction", fieldByCode: SAVE_FIELD_BY_CODE })
  }
}

/**
 * `PATCH /admin/eventos/:id`. Lê a corrida antes: se o slug mudar, a página pública do slug antigo
 * também precisa sair do cache.
 */
export async function updateAdminEventAction(id: number, input: AdminEventFormInput): Promise<HttpResponse<AdminEvent>> {
  const denied = await ensureCanManageEvents(SAVE_ERROR_TITLE, "updateAdminEventAction")
  if (denied) return denied

  const parsedId = eventIdSchema.safeParse(id)
  if (!parsedId.success) return invalidInputResponse(SAVE_ERROR_TITLE)
  const parsed = adminEventFormSchema.safeParse(input)
  if (!parsed.success) return invalidInputResponse(SAVE_ERROR_TITLE, parsed.error.issues[0])

  try {
    const previous = await getAdminEvent(parsedId.data)
    const data = await updateAdminEvent(parsedId.data, parsed.data)
    revalidateEventTags(previous.slug, data.slug)
    return { status: 200, data, title: "Corrida atualizada" }
  } catch (error) {
    return toErrorResponse(error, { title: SAVE_ERROR_TITLE, context: "updateAdminEventAction", fieldByCode: SAVE_FIELD_BY_CODE })
  }
}

/** `DELETE /admin/eventos/:id` (soft delete). Revalida a página pública do slug excluído. */
export async function deleteAdminEventAction(id: number): Promise<HttpResponse> {
  const denied = await ensureCanManageEvents(DELETE_ERROR_TITLE, "deleteAdminEventAction")
  if (denied) return denied

  const parsedId = eventIdSchema.safeParse(id)
  if (!parsedId.success) return invalidInputResponse(DELETE_ERROR_TITLE)

  try {
    const previous = await getAdminEvent(parsedId.data)
    await deleteAdminEvent(parsedId.data)
    revalidateEventTags(previous.slug)
    return { status: 204, title: "Corrida excluída" }
  } catch (error) {
    return toErrorResponse(error, { title: DELETE_ERROR_TITLE, context: "deleteAdminEventAction" })
  }
}

/**
 * `POST /admin/eventos/:id/<acao>` (publicar, despublicar, encerrar, cancelar, restaurar).
 * Toda ação muda o que o público vê (entra ou sai do site): revalida a lista e a página do slug.
 */
export async function runEventActionAction(id: number, action: EVENT_ACTION): Promise<HttpResponse> {
  const denied = await ensureCanManageEvents(ACTION_ERROR_TITLE, "runEventActionAction")
  if (denied) return denied

  const parsedId = eventIdSchema.safeParse(id)
  const parsedAction = eventActionSchema.safeParse(action)
  if (!parsedId.success || !parsedAction.success) return invalidInputResponse(ACTION_ERROR_TITLE)

  try {
    const previous = await getAdminEvent(parsedId.data)
    await runEventAction(parsedId.data, parsedAction.data)
    revalidateEventTags(previous.slug)
    return { status: 204 }
  } catch (error) {
    return toErrorResponse(error, { title: ACTION_ERROR_TITLE, context: "runEventActionAction" })
  }
}
