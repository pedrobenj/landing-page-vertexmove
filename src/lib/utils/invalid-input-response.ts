import { API_ERROR_CODE } from "@/enums/api-error-code.enum"
import type { HttpResponse } from "@/types/http-response.interface"

import { getApiErrorMessage } from "./api-errors"

interface ZodLikeIssue {
  message: string
  path: PropertyKey[]
}

/** 422 `DADO_INVALIDO` de uma action: com a primeira falha do Zod, aponta o campo para o `setError`. */
export function invalidInputResponse(title: string, issue?: ZodLikeIssue): HttpResponse<never> {
  const field = issue?.path.map(String).join(".")
  return {
    status: 422,
    code: API_ERROR_CODE.INVALID_DATA,
    error: issue?.message ?? getApiErrorMessage(API_ERROR_CODE.INVALID_DATA),
    title,
    ...(field && { field }),
  }
}
