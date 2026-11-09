import "server-only"

import { API_ERROR_CODE } from "@/enums/api-error-code.enum"

import { isApiError } from "./api-error"

/** `true` para o `503 LOJA_INDISPONIVEL` do `endpoints/store.ts` (loja ainda sem backend). */
export function isStoreUnavailable(error: unknown): boolean {
  return isApiError(error) && error.codigo === API_ERROR_CODE.STORE_UNAVAILABLE
}

