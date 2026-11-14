import "server-only"

import { unstable_rethrow } from "next/navigation"

import { API_ERROR_CODE } from "@/enums/api-error-code.enum"
import { getApiErrorMessage } from "@/lib/utils/api-errors"
import { parseApiFieldError } from "@/lib/utils/parse-api-field-error"
import type { HttpResponse } from "@/types/http-response.interface"

import { isApiError } from "./api-error"

const ACCESS_DENIED_MESSAGE = getApiErrorMessage(API_ERROR_CODE.ACCESS_DENIED)
const INVALID_FIELD_MESSAGE = "Confira este campo."

interface ToErrorResponseOptions {
  title: string
  /** Nome da action, só para o log. */
  context: string
  /** Campo associado a um código de erro (ex.: `SLUG_DUPLICADO` → `slug`). */
  fieldByCode?: Partial<Record<string, string>>
}

/**
 * Erro de uma server action do admin → `HttpResponse`.
 *
 * - Relança os erros de controle do Next (`redirect()` do `adminFetch`, `notFound()`): por isso deve
 *   ser a primeira coisa no `catch`.
 * - `ApiError` → mensagem amigável; 422 com campo (`"campo: mensagem"` ou `detalhes[].campo`) preenche
 *   `field` para o `setError`.
 * - Outros erros → 500, logando só o nome do erro (nunca o corpo: pode ter PII).
 */
/** 422: `"campo: mensagem"` (mock) ou `detalhes[].campo` (backend, que não manda mensagem por campo). */
function toFieldError(mensagem: string, campo: string | undefined) {
  return parseApiFieldError(mensagem) ?? (campo ? { field: campo, message: INVALID_FIELD_MESSAGE } : null)
}

export function toErrorResponse(error: unknown, { title, context, fieldByCode }: ToErrorResponseOptions): HttpResponse<never> {
  unstable_rethrow(error)

  if (isApiError(error)) {
    const codeField = fieldByCode?.[error.codigo]
    if (codeField) {
      return { status: error.status, code: error.codigo, error: getApiErrorMessage(error.codigo), title, field: codeField }
    }
    const fieldError = error.status === 422 ? toFieldError(error.mensagem, error.campo) : null
    return {
      status: error.status,
      code: error.codigo,
      error: fieldError?.message ?? getApiErrorMessage(error.codigo, error.status === 403 ? ACCESS_DENIED_MESSAGE : undefined),
      title,
      ...(fieldError && { field: fieldError.field }),
    }
  }

  console.error(`[${context}]`, error instanceof Error ? error.name : "erro desconhecido")
  return { status: 500, code: API_ERROR_CODE.UNKNOWN, error: getApiErrorMessage(undefined), title }
}
