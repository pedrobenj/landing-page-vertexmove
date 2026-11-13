"use server"

import { API_ERROR_CODE } from "@/enums/api-error-code.enum"
import { getApiErrorMessage } from "@/lib/utils/api-errors"
import { toApiDate } from "@/lib/utils/format-api-date"
import { normalizeCpf } from "@/lib/utils/normalize-cpf"
import { toE164Phone } from "@/lib/utils/to-e164-phone"
import { lookupSchema, type LookupInput } from "@/lib/validations/lookup.schema"
import { receiptRequestSchema, type ReceiptRequestInput } from "@/lib/validations/receipt.schema"
import { createRegistrationInputSchema } from "@/lib/validations/registration.schema"
import { isApiError } from "@/server/api/api-error"
import { createRegistration, getRegistrationReceipt, lookupRegistrations } from "@/server/api/endpoints/registrations"
import { saveRegistrationAccess } from "@/server/api/registration-access"
import { buildRegistrationReceiptPdf, getReceiptFileName } from "@/server/pdf/registration-receipt-pdf"
import type { CursorPage } from "@/types/api/cursor-page.interface"
import type {
  RegistrationReceipt,
  RegistrationReceiptFile,
  RegistrationReceiptInput,
} from "@/types/api/registration-receipt.interface"
import type {
  CreatedRegistration,
  CreateRegistrationInput,
  RegistrationLookupInput,
  RegistrationLookupItem,
} from "@/types/api/registration.interface"
import type { HttpResponse } from "@/types/http-response.interface"

const CREATE_ERROR_TITLE = "Não foi possível concluir a inscrição"
const LOOKUP_ERROR_TITLE = "Não foi possível consultar"
const RECEIPT_ERROR_TITLE = "Não foi possível abrir a inscrição"
const RECEIPT_NOT_FOUND_MESSAGE = "A data de nascimento não confere com a inscrição. Confira e tente de novo."

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
    // O token fica só no cookie HttpOnly do Next: a resposta ao navegador sai sem ele.
    const { accessToken, ...data } = await createRegistration(parsed.data)
    if (accessToken) await saveRegistrationAccess(data.codigo, accessToken)
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

/** Valida a entrada do comprovante e converte o nascimento para `YYYY-MM-DD`; `null` se inválida. */
function toReceiptRequest(input: ReceiptRequestInput): RegistrationReceiptInput | null {
  const parsed = receiptRequestSchema.safeParse(input)
  if (!parsed.success) return null
  return { referencia: parsed.data.referencia, dataNascimento: toApiDate(parsed.data.dataNascimento) }
}

/** Erro do comprovante: 404 (referência ou nascimento não conferem) ganha mensagem própria. */
function toReceiptErrorResponse(error: unknown, context: string): HttpResponse<never> {
  const response = toErrorResponse(error, RECEIPT_ERROR_TITLE, context)
  return response.status === 404 ? { ...response, error: RECEIPT_NOT_FOUND_MESSAGE } : response
}

const INVALID_RECEIPT_REQUEST: HttpResponse<never> = {
  status: 422,
  code: API_ERROR_CODE.INVALID_DATA,
  error: "Informe uma data de nascimento válida.",
  title: RECEIPT_ERROR_TITLE,
}

/** Dados da inscrição para o atleta ver, liberados pela data de nascimento (`POST /inscricoes/comprovante`). */
export async function getRegistrationReceiptAction(input: ReceiptRequestInput): Promise<HttpResponse<RegistrationReceipt>> {
  const body = toReceiptRequest(input)
  if (!body) return INVALID_RECEIPT_REQUEST
  try {
    const data = await getRegistrationReceipt(body)
    return { status: 200, data }
  } catch (error) {
    return toReceiptErrorResponse(error, "getRegistrationReceiptAction")
  }
}

/** Comprovante em PDF (gerado no servidor) para o navegador baixar. Busca os dados de novo na API. */
export async function downloadRegistrationReceiptAction(
  input: ReceiptRequestInput,
): Promise<HttpResponse<RegistrationReceiptFile>> {
  const body = toReceiptRequest(input)
  if (!body) return INVALID_RECEIPT_REQUEST
  try {
    const receipt = await getRegistrationReceipt(body)
    const pdf = await buildRegistrationReceiptPdf(receipt)
    return {
      status: 200,
      data: { fileName: getReceiptFileName(receipt.codigo), base64: Buffer.from(pdf).toString("base64") },
    }
  } catch (error) {
    return toReceiptErrorResponse(error, "downloadRegistrationReceiptAction")
  }
}
