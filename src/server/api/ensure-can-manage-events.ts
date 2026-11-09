import "server-only"

import { API_ERROR_CODE } from "@/enums/api-error-code.enum"
import { canManageEvents } from "@/lib/utils/admin-permissions"
import { getApiErrorMessage } from "@/lib/utils/api-errors"
import type { HttpResponse } from "@/types/http-response.interface"

import { requireAdminSession } from "./require-admin-session"
import { toErrorResponse } from "./to-error-response"

/**
 * Sessão obrigatória e papel que pode alterar corridas e o catálogo delas (o operador só lê; matriz a
 * confirmar, §16). Devolve `null` se pode seguir, ou a resposta de erro.
 *
 * O `toErrorResponse` relança o redirect do `adminFetch` (sem sessão → login); falhas de rede do
 * `GET /admin/me` viram `HttpResponse` em vez de exceção.
 */
export async function ensureCanManageEvents(title: string, context: string): Promise<HttpResponse<never> | null> {
  try {
    const admin = await requireAdminSession()
    if (canManageEvents(admin.papel)) return null
    return { status: 403, code: API_ERROR_CODE.ACCESS_DENIED, error: getApiErrorMessage(API_ERROR_CODE.ACCESS_DENIED), title }
  } catch (error) {
    return toErrorResponse(error, { title, context })
  }
}
