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
import { getRegistrationAccessToken } from "@/server/api/registration-access"
import { toErrorResponse } from "@/server/api/to-error-response"
import type { RegistrationCheckout, RegistrationDetails } from "@/types/api/registration-details.interface"
import type { HttpResponse } from "@/types/http-response.interface"

const DETAILS_ERROR_TITLE = "Não foi possível consultar a inscrição"
const CHECKOUT_ERROR_TITLE = "Não foi possível abrir o pagamento"

const NO_ACCESS_MESSAGE =
  "Abra esta inscrição no mesmo aparelho em que ela foi feita, ou consulte o status em Consultar inscrição."

function invalidCode(title: string): HttpResponse<never> {
  return { status: 404, code: API_ERROR_CODE.NOT_FOUND, error: getApiErrorMessage(API_ERROR_CODE.NOT_FOUND), title }
}

/** O token da inscrição só existe no navegador em que ela foi feita (cookie HttpOnly). */
async function requireAccessToken(codigo: string, title: string): Promise<string | HttpResponse<never>> {
  const token = await getRegistrationAccessToken(codigo)
  return token ?? { status: 401, code: API_ERROR_CODE.NOT_AUTHENTICATED, error: NO_ACCESS_MESSAGE, title }
}

function invalidCheckoutUrl(): HttpResponse<never> {
  return {
    status: 502,
    code: API_ERROR_CODE.INVALID_CHECKOUT_URL,
    error: getApiErrorMessage(API_ERROR_CODE.INVALID_CHECKOUT_URL),
    title: CHECKOUT_ERROR_TITLE,
  }
}

/** Status da inscrição por código (sem PII). Usado no polling da página de retorno. */
export async function getRegistrationDetailsAction(codigo: string): Promise<HttpResponse<RegistrationDetails>> {
  if (!isRegistrationCode(codigo)) return invalidCode(DETAILS_ERROR_TITLE)
  const token = await requireAccessToken(codigo, DETAILS_ERROR_TITLE)
  if (typeof token !== "string") return token
  try {
    return { status: 200, data: await getRegistrationDetails(codigo, token) }
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
  const token = await requireAccessToken(codigo, CHECKOUT_ERROR_TITLE)
  if (typeof token !== "string") return token
  try {
    const { checkoutUrl } = await createRegistrationCheckout(codigo, token)
    if (checkoutUrl === null) {
      console.error("[startRegistrationCheckoutAction]", "checkout sem checkoutUrl")
      return invalidCheckoutUrl()
    }
    if (!isAllowedCheckoutUrl(checkoutUrl, { allowMockCheckout: env.USE_MOCK_API })) {
      console.error("[startRegistrationCheckoutAction]", "checkoutUrl fora do Mercado Pago")
      return invalidCheckoutUrl()
    }
    return { status: 201, data: { checkoutUrl } }
  } catch (error) {
    return toErrorResponse(error, { title: CHECKOUT_ERROR_TITLE, context: "startRegistrationCheckoutAction" })
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
 * `/inscricao/retorno` com os mesmos parâmetros que o Mercado Pago anexa.
 */
export async function simulateMockPaymentAction(codigo: string, resultado: PAYMENT_STATUS): Promise<void> {
  const status = MOCK_RETURN_STATUS[resultado]
  if (!env.USE_MOCK_API || !isRegistrationCode(codigo) || status === undefined) return
  try {
    await simulateMockPayment(codigo, resultado)
  } catch (error) {
    console.error("[simulateMockPaymentAction]", error instanceof Error ? error.name : "erro desconhecido")
  }
  const query = new URLSearchParams({
    collection_status: status,
    status,
    external_reference: codigo,
    payment_id: `MOCK-${Date.now()}`,
  })
  redirect(`/inscricao/retorno?${query.toString()}`)
}
