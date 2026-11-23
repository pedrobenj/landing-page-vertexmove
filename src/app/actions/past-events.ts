"use server"

import { z } from "zod"

import { API_ERROR_CODE } from "@/enums/api-error-code.enum"
import { getApiErrorMessage } from "@/lib/utils/api-errors"
import { invalidInputResponse } from "@/lib/utils/invalid-input-response"
import { isApiError } from "@/server/api/api-error"
import { listPastEvents } from "@/server/api/endpoints/events"
import type { CursorPage } from "@/types/api/cursor-page.interface"
import type { PublicEvent } from "@/types/api/event.interface"
import type { HttpResponse } from "@/types/http-response.interface"

const LOAD_MORE_ERROR_TITLE = "Não foi possível carregar mais corridas"

/** O cursor é opaco (vem do `nextCursor` da API): só limita o tamanho. */
const cursorSchema = z.string().trim().min(1).max(512)

/** "Carregar mais" de `/corridas/encerradas`: próxima página de `GET /eventos/encerrados`. */
export async function loadMorePastEventsAction(cursor: string): Promise<HttpResponse<CursorPage<PublicEvent>>> {
  const parsed = cursorSchema.safeParse(cursor)
  if (!parsed.success) return invalidInputResponse(LOAD_MORE_ERROR_TITLE)

  try {
    return { status: 200, data: await listPastEvents(parsed.data) }
  } catch (error) {
    if (isApiError(error)) {
      return { status: error.status, code: error.codigo, error: getApiErrorMessage(error.codigo), title: LOAD_MORE_ERROR_TITLE }
    }
    console.error("[loadMorePastEventsAction]", error instanceof Error ? error.name : "erro desconhecido")
    return { status: 500, code: API_ERROR_CODE.UNKNOWN, error: getApiErrorMessage(undefined), title: LOAD_MORE_ERROR_TITLE }
  }
}
