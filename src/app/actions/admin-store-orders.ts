"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { API_ERROR_CODE } from "@/enums/api-error-code.enum"
import { ORDER_STATUS } from "@/enums/order-status.enum"
import { STORE_ORDER_ACTION } from "@/enums/store-order-action.enum"
import { canManageStore } from "@/lib/utils/admin-permissions"
import { getApiErrorMessage } from "@/lib/utils/api-errors"
import { invalidInputResponse } from "@/lib/utils/invalid-input-response"
import { isOrderCode } from "@/lib/utils/is-order-code"
import { listAdminStoreOrders, runStoreOrderAction } from "@/server/api/endpoints/store-orders"
import { requireAdminSession } from "@/server/api/require-admin-session"
import { toErrorResponse } from "@/server/api/to-error-response"
import type { CursorPage } from "@/types/api/cursor-page.interface"
import type { ApiAdminStoreOrder } from "@/types/api/store-order.interface"
import type { HttpResponse } from "@/types/http-response.interface"

const LIST_ERROR_TITLE = "Não foi possível carregar os pedidos"
const ACTION_ERROR_TITLE = "Não foi possível alterar o pedido"

const listSchema = z.object({
  status: z.union([z.enum(ORDER_STATUS), z.literal("todos")]),
  cursor: z.string().min(1).max(200).nullable(),
})
const actionSchema = z.enum(STORE_ORDER_ACTION)

export type ListAdminStoreOrdersInput = z.input<typeof listSchema>

/** Página da lista de pedidos do admin (filtro e cursor vêm do Zustand). */
export async function listAdminStoreOrdersAction(input: ListAdminStoreOrdersInput): Promise<HttpResponse<CursorPage<ApiAdminStoreOrder>>> {
  const parsed = listSchema.safeParse(input)
  if (!parsed.success) return invalidInputResponse(LIST_ERROR_TITLE)
  const { status, cursor } = parsed.data
  try {
    const data = await listAdminStoreOrders({ status: status === "todos" ? undefined : status, cursor: cursor ?? undefined })
    return { status: 200, data }
  } catch (error) {
    return toErrorResponse(error, { title: LIST_ERROR_TITLE, context: "listAdminStoreOrdersAction" })
  }
}

/**
 * Pronto para retirada, retirado ou cancelar. Revalida o admin e a loja (cancelar um pendente devolve o
 * estoque). A API confere a transição de novo e responde `409 CONFLITO_DE_ESTADO` se o status mudou.
 */
export async function runStoreOrderActionAction(codigo: string, action: STORE_ORDER_ACTION): Promise<HttpResponse> {
  try {
    const admin = await requireAdminSession()
    if (!canManageStore(admin.papel)) {
      return { status: 403, code: API_ERROR_CODE.ACCESS_DENIED, error: getApiErrorMessage(API_ERROR_CODE.ACCESS_DENIED), title: ACTION_ERROR_TITLE }
    }
  } catch (error) {
    return toErrorResponse(error, { title: ACTION_ERROR_TITLE, context: "runStoreOrderActionAction" })
  }

  const parsedAction = actionSchema.safeParse(action)
  if (!isOrderCode(codigo) || !parsedAction.success) return invalidInputResponse(ACTION_ERROR_TITLE)

  try {
    await runStoreOrderAction(codigo, parsedAction.data)
    revalidatePath("/admin/loja/pedidos")
    revalidatePath(`/admin/loja/pedidos/${codigo}`)
    revalidatePath("/loja", "layout")
    return { status: 204 }
  } catch (error) {
    return toErrorResponse(error, { title: ACTION_ERROR_TITLE, context: "runStoreOrderActionAction" })
  }
}
