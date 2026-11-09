"use server"

import { z } from "zod"

import { API_ERROR_CODE } from "@/enums/api-error-code.enum"
import { EVENT_STATUS } from "@/enums/event-status.enum"
import { getApiErrorMessage } from "@/lib/utils/api-errors"
import { listAdminEvents } from "@/server/api/endpoints/admin-events"
import { toErrorResponse } from "@/server/api/to-error-response"
import type { AdminEvent } from "@/types/api/admin-event.interface"
import type { CursorPage } from "@/types/api/cursor-page.interface"
import type { HttpResponse } from "@/types/http-response.interface"

const LIST_ERROR_TITLE = "Não foi possível carregar as corridas"

const listAdminEventsSchema = z.object({
  status: z.union([z.enum(EVENT_STATUS), z.literal("todos")]),
  cursor: z.string().min(1).max(200).nullable(),
})

export type ListAdminEventsInput = z.input<typeof listAdminEventsSchema>

/** `GET /admin/eventos?status&cursor` (o `adminFetch` exige a sessão). */
export async function listAdminEventsAction(input: ListAdminEventsInput): Promise<HttpResponse<CursorPage<AdminEvent>>> {
  const parsed = listAdminEventsSchema.safeParse(input)
  if (!parsed.success) {
    return {
      status: 422,
      code: API_ERROR_CODE.INVALID_DATA,
      error: getApiErrorMessage(API_ERROR_CODE.INVALID_DATA),
      title: LIST_ERROR_TITLE,
    }
  }

  const { status, cursor } = parsed.data
  try {
    const data = await listAdminEvents({ status: status === "todos" ? undefined : status, cursor: cursor ?? undefined })
    return { status: 200, data }
  } catch (error) {
    return toErrorResponse(error, { title: LIST_ERROR_TITLE, context: "listAdminEventsAction" })
  }
}
