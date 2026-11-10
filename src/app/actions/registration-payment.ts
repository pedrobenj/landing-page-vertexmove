"use server"

import { redirect } from "next/navigation"

import { API_ERROR_CODE } from "@/enums/api-error-code.enum"
import { PAYMENT_STATUS } from "@/enums/payment-status.enum"
import { env } from "@/lib/env"
import { getApiErrorMessage } from "@/lib/utils/api-errors"
import { isAllowedCheckoutUrl } from "@/lib/utils/checkout-url"
import { isRegistrationCode } from "@/lib/utils/is-registration-code"
import {
  createRegistrationCheckout,
  getRegistrationDetails,
  simulateMockPayment,
} from "@/server/api/endpoints/registration-payment"
import { toErrorResponse } from "@/server/api/to-error-response"
import type { RegistrationCheckout, RegistrationDetails } from "@/types/api/registration-details.interface"
import type { HttpResponse } from "@/types/http-response.interface"

const DETAILS_ERROR_TITLE = "Não foi possível consultar a inscrição"
const CHECKOUT_ERROR_TITLE = "Não foi possível abrir o pagamento"

function invalidCode(title: string): HttpResponse<never> {
  return { status: 404, code: API_ERROR_CODE.NOT_FOUND, error: getApiErrorMessage(API_ERROR_CODE.NOT_FOUND), title }
}

/** Status da inscrição por código (sem PII). Usado no polling da página de retorno. */
export async function getRegistrationDetailsAction(codigo: string): Promise<HttpResponse<RegistrationDetails>> {
  if (!isRegistrationCode(codigo)) return invalidCode(DETAILS_ERROR_TITLE)
  try {
    return { status: 200, data: await getRegistrationDetails(codigo) }
  } catch (error) {
    return toErrorResponse(error, { title: DETAILS_ERROR_TITLE, context: "getRegistrationDetailsAction" })
  }
}

/**
 * Pede ao backend o link do Checkout Pro. Só devolve links HTTPS do Mercado Pago (ou o checkout falso
 * do mock): o client redireciona sem montar URL nenhuma.
 */
export async function startRegistrationCheckoutAction(codigo: string): Promise<HttpResponse<RegistrationCheckout>> {
  if (!isRegistrationCode(codigo)) return invalidCode(CHECKOUT_ERROR_TITLE)
  try {
    const checkout = await createRegistrationCheckout(codigo)
    if (!isAllowedCheckoutUrl(checkout.checkoutUrl, { allowMockCheckout: env.USE_MOCK_API })) {
      console.error("[startRegistrationCheckoutAction]", "checkoutUrl fora do Mercado Pago")
      return {
        status: 502,
        code: API_ERROR_CODE.INVALID_CHECKOUT_URL,
        error: getApiErrorMessage(API_ERROR_CODE.INVALID_CHECKOUT_URL),
        title: CHECKOUT_ERROR_TITLE,
      }
    }
    return { status: 201, data: checkout }
  } catch (error) {
    return toErrorResponse(error, { title: CHECKOUT_ERROR_TITLE, context: "startRegistrationCheckoutAction" })
  }
}

const MOCK_RETURN_STATUS: Record<PAYMENT_STATUS, string> = {
  [PAYMENT_STATUS.APPROVED]: "approved",
  [PAYMENT_STATUS.PENDING]: "pending",
  [PAYMENT_STATUS.REJECTED]: "rejected",
  [PAYMENT_STATUS.CANCELLED]: "null",
}

/**
 * Checkout falso (só com `USE_MOCK_API`): registra o resultado como o webhook faria e volta para
 * `/inscricao/retorno` com os mesmos parâmetros que o Mercado Pago anexa.
 */
export async function simulateMockPaymentAction(codigo: string, resultado: PAYMENT_STATUS): Promise<void> {
  if (!env.USE_MOCK_API || !isRegistrationCode(codigo) || !(resultado in MOCK_RETURN_STATUS)) return
  try {
    await simulateMockPayment(codigo, resultado)
  } catch (error) {
    console.error("[simulateMockPaymentAction]", error instanceof Error ? error.name : "erro desconhecido")
  }
  const status = MOCK_RETURN_STATUS[resultado]
  const query = new URLSearchParams({
    collection_status: status,
    status,
    external_reference: codigo,
    payment_id: `MOCK-${Date.now()}`,
  })
  redirect(`/inscricao/retorno?${query.toString()}`)
}
