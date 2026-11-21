"use server"

import { redirect } from "next/navigation"

import { API_ERROR_CODE } from "@/enums/api-error-code.enum"
import type { ORDER_STATUS } from "@/enums/order-status.enum"
import { PAYMENT_STATUS } from "@/enums/payment-status.enum"
import { env } from "@/lib/env"
import { getApiErrorMessage } from "@/lib/utils/api-errors"
import { isAllowedCheckoutUrl } from "@/lib/utils/checkout-url"
import { isOrderCode } from "@/lib/utils/is-order-code"
import { getStoreOrder } from "@/server/api/endpoints/store"
import { createStoreOrderCheckout, simulateMockStorePayment } from "@/server/api/endpoints/store-payment"
import { getStoreOrderAccessToken } from "@/server/api/store-order-access"
import { toErrorResponse } from "@/server/api/to-error-response"
import type { HttpResponse } from "@/types/http-response.interface"

const STATUS_ERROR_TITLE = "Não foi possível consultar o pedido"
const CHECKOUT_ERROR_TITLE = "Não foi possível abrir o pagamento"

const NO_ACCESS_MESSAGE = "Abra este pedido no mesmo aparelho em que a compra foi feita para pagar."

function invalidCode(title: string): HttpResponse<never> {
  return { status: 404, code: API_ERROR_CODE.NOT_FOUND, error: getApiErrorMessage(API_ERROR_CODE.NOT_FOUND), title }
}

function invalidCheckoutUrl(): HttpResponse<never> {
  return {
    status: 502,
    code: API_ERROR_CODE.INVALID_CHECKOUT_URL,
    error: getApiErrorMessage(API_ERROR_CODE.INVALID_CHECKOUT_URL),
    title: CHECKOUT_ERROR_TITLE,
  }
}

/** Status do pedido (resumo público, decisão L4). Usado no polling da volta do Mercado Pago. */
export async function getStoreOrderStatusAction(codigo: string): Promise<HttpResponse<{ status: ORDER_STATUS }>> {
  if (!isOrderCode(codigo)) return invalidCode(STATUS_ERROR_TITLE)
  try {
    const { status } = await getStoreOrder(codigo)
    return { status: 200, data: { status } }
  } catch (error) {
    return toErrorResponse(error, { title: STATUS_ERROR_TITLE, context: "getStoreOrderStatusAction" })
  }
}

/**
 * Pede ao backend o link do Checkout Pro do pedido, com o token do cookie HttpOnly. Só devolve links
 * HTTPS do Mercado Pago (ou o checkout falso do mock): o client redireciona sem montar URL nenhuma.
 */
export async function startStoreCheckoutAction(codigo: string): Promise<HttpResponse<{ checkoutUrl: string }>> {
  if (!isOrderCode(codigo)) return invalidCode(CHECKOUT_ERROR_TITLE)
  const token = await getStoreOrderAccessToken(codigo)
  if (!token) return { status: 401, code: API_ERROR_CODE.NOT_AUTHENTICATED, error: NO_ACCESS_MESSAGE, title: CHECKOUT_ERROR_TITLE }
  try {
    const { checkoutUrl } = await createStoreOrderCheckout(codigo, token)
    if (!checkoutUrl || !isAllowedCheckoutUrl(checkoutUrl, { allowMockCheckout: env.USE_MOCK_API })) {
      console.error("[startStoreCheckoutAction]", "checkoutUrl ausente ou fora do Mercado Pago")
      return invalidCheckoutUrl()
    }
    return { status: 201, data: { checkoutUrl } }
  } catch (error) {
    return toErrorResponse(error, { title: CHECKOUT_ERROR_TITLE, context: "startStoreCheckoutAction" })
  }
}

const MOCK_RETURN_STATUS: Partial<Record<PAYMENT_STATUS, string>> = {
  [PAYMENT_STATUS.APPROVED]: "approved",
  [PAYMENT_STATUS.PENDING]: "pending",
  [PAYMENT_STATUS.REJECTED]: "rejected",
  [PAYMENT_STATUS.CANCELLED]: "null",
}

/**
 * Checkout falso (só com `USE_MOCK_API`): registra o resultado como o webhook faria e volta para
 * `/pedido/<codigo>` (o `back_urls` do pedido) com os parâmetros que o Mercado Pago anexa.
 */
export async function simulateMockStorePaymentAction(codigo: string, resultado: PAYMENT_STATUS): Promise<void> {
  const status = MOCK_RETURN_STATUS[resultado]
  if (!env.USE_MOCK_API || !isOrderCode(codigo) || status === undefined) return
  try {
    await simulateMockStorePayment(codigo, resultado)
  } catch (error) {
    console.error("[simulateMockStorePaymentAction]", error instanceof Error ? error.name : "erro desconhecido")
  }
  const query = new URLSearchParams({ collection_status: status, status, external_reference: codigo, payment_id: `MOCK-${Date.now()}` })
  redirect(`/pedido/${codigo}?${query.toString()}`)
}
