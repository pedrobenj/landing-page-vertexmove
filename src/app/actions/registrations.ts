"use server"

import { API_ERROR_CODE } from "@/enums/api-error-code.enum"
import { getApiErrorMessage } from "@/lib/utils/api-errors"
import { normalizeCpf } from "@/lib/utils/normalize-cpf"
import { toE164Phone } from "@/lib/utils/to-e164-phone"
import { lookupSchema, type LookupInput } from "@/lib/validations/lookup.schema"
import { createRegistrationInputSchema } from "@/lib/validations/registration.schema"
import { isApiError } from "@/server/api/api-error"
import { createRegistration, lookupRegistrations } from "@/server/api/endpoints/registrations"
import type { CursorPage } from "@/types/api/cursor-page.interface"
import type {
  CreatedRegistration,
  CreateRegistrationInput,
  RegistrationLookupInput,
  RegistrationLookupItem,
} from "@/types/api/registration.interface"
import type { HttpResponse } from "@/types/http-response.interface"

const CREATE_ERROR_TITLE = "Não foi possível concluir a inscrição"
const LOOKUP_ERROR_TITLE = "Não foi possível consultar"

/** `ApiError` → `HttpResponse` com mensagem amigável; outros erros viram 500. Nunca loga o erro inteiro (PII). */
function toErrorResponse(error: unknown, title: string, context: string): HttpResponse<never> {
  if (isApiError(error)) {
    return { status: error.status, code: error.codigo, error: getApiErrorMessage(error.codigo), title }
  }
  console.error(`[${context}]`, error instanceof Error ? error.name : "erro desconhecido")
  return { status: 500, code: API_ERROR_CODE.UNKNOWN, error: getApiErrorMessage(undefined), title }
}

/**
 * `POST /inscricoes`. O preço e o desconto são calculados pela API — o front só exibe o que volta.
 * O IP/User-Agent do atleta seguem para o rate limit do backend (`apiFetch`).
 */
export async function createRegistrationAction(
  input: CreateRegistrationInput,
): Promise<HttpResponse<CreatedRegistration>> {
  const parsed = createRegistrationInputSchema.safeParse(input)
  if (!parsed.success) {
    return {
      status: 422,
      code: API_ERROR_CODE.INVALID_DATA,
      error: getApiErrorMessage(API_ERROR_CODE.INVALID_DATA),
      title: CREATE_ERROR_TITLE,
    }
  }

  try {
    const data = await createRegistration(parsed.data)
    return { status: 201, data, title: "Inscrição realizada!" }
  } catch (error) {
    return toErrorResponse(error, CREATE_ERROR_TITLE, "createRegistrationAction")
  }
}

/** Consulta sem login (`POST /inscricoes/consulta`): a API devolve só dados mascarados. */
export async function lookupRegistrationsAction(
  input: LookupInput,
): Promise<HttpResponse<CursorPage<RegistrationLookupItem>>> {
  const parsed = lookupSchema.safeParse(input)
  if (!parsed.success) {
    return {
      status: 422,
      code: API_ERROR_CODE.INVALID_DATA,
      error: parsed.error.issues[0]?.message ?? getApiErrorMessage(API_ERROR_CODE.INVALID_DATA),
      title: LOOKUP_ERROR_TITLE,
    }
  }

  const { tipo, valor } = parsed.data
  const body: RegistrationLookupInput = tipo === "cpf" ? { cpf: normalizeCpf(valor) } : { whatsapp: toE164Phone(valor) }

  try {
    const data = await lookupRegistrations(body)
    return { status: 200, data }
  } catch (error) {
    return toErrorResponse(error, LOOKUP_ERROR_TITLE, "lookupRegistrationsAction")
  }
}
