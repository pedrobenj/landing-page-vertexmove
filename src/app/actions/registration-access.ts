"use server"

import { redirect } from "next/navigation"

import { API_ERROR_CODE } from "@/enums/api-error-code.enum"
import { isRegistrationCode } from "@/lib/utils"
import { invalidInputResponse } from "@/lib/utils/invalid-input-response"
import { ACCESS_LINK_INVALID_MESSAGE, ACCESS_LINK_SENT_MESSAGE } from "@/lib/utils/registration-access-messages"
import { toLookupBody } from "@/lib/utils/to-lookup-body"
import { lookupSchema, type LookupInput } from "@/lib/validations/lookup.schema"
import { isApiError } from "@/server/api/api-error"
import { redeemRegistrationAccessToken, requestRegistrationAccessLink } from "@/server/api/endpoints/registration-access"
import { saveRegistrationAccess } from "@/server/api/registration-access"
import { toErrorResponse } from "@/server/api/to-error-response"
import type { HttpResponse } from "@/types/http-response.interface"

const REQUEST_ERROR_TITLE = "Não foi possível pedir o link"
const REDEEM_ERROR_TITLE = "Não foi possível abrir a inscrição"

/** Token do link: base64url (o backend gera 32 bytes aleatórios). Qualquer outra coisa nem vai à API. */
const TOKEN_PATTERN = /^[\w-]{1,200}$/

const INVALID_LINK: HttpResponse<never> = {
  status: 410,
  code: API_ERROR_CODE.ACCESS_LINK_INVALID,
  error: ACCESS_LINK_INVALID_MESSAGE,
  title: REDEEM_ERROR_TITLE,
}

/**
 * "Receber link de acesso por e-mail" na consulta (`POST /inscricoes/acesso/link`). Mesma entrada da
 * consulta e sempre a mesma resposta, exista ou não inscrição com e-mail: não revela cadastro.
 * Rate limit (429) e API fora aparecem como erro, também sem dizer nada sobre o cadastro.
 */
export async function requestAccessLinkAction(input: LookupInput): Promise<HttpResponse<never>> {
  const parsed = lookupSchema.safeParse(input)
  if (!parsed.success) return invalidInputResponse(REQUEST_ERROR_TITLE, parsed.error.issues[0])

  try {
    await requestRegistrationAccessLink(toLookupBody(parsed.data))
    return { status: 202, title: ACCESS_LINK_SENT_MESSAGE }
  } catch (error) {
    return toErrorResponse(error, { title: REQUEST_ERROR_TITLE, context: "requestAccessLinkAction" })
  }
}

/**
 * Abre o link do e-mail (`/inscricao/acesso?t=`): troca o token (uso único, 30 min) pelo `accessToken`
 * reemitido, grava o cookie HttpOnly da inscrição (como na criação) e leva a `/inscricao/<codigo>`.
 * O token nunca volta ao navegador. Token inexistente, vencido ou usado → `LINK_ACESSO_INVALIDO`.
 */
export async function redeemAccessLinkAction(token: string): Promise<HttpResponse<never>> {
  if (typeof token !== "string" || !TOKEN_PATTERN.test(token)) return INVALID_LINK

  let codigo: string
  try {
    const grant = await redeemRegistrationAccessToken(token)
    if (!isRegistrationCode(grant.codigo) || !grant.accessToken) return INVALID_LINK
    await saveRegistrationAccess(grant.codigo, grant.accessToken)
    codigo = grant.codigo
  } catch (error) {
    // 4xx da troca = link ruim (o backend não diz por quê); 429 e falhas de rede/servidor mantêm a mensagem própria.
    if (isApiError(error) && error.status >= 400 && error.status < 500 && error.status !== 429) return INVALID_LINK
    return toErrorResponse(error, { title: REDEEM_ERROR_TITLE, context: "redeemAccessLinkAction" })
  }
  redirect(`/inscricao/${codigo}`)
}
