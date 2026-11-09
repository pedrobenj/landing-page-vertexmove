"use server"

import { redirect } from "next/navigation"

import { API_ERROR_CODE } from "@/enums/api-error-code.enum"
import { getApiErrorMessage } from "@/lib/utils/api-errors"
import { ADMIN_HOME_PATH, ADMIN_LOGIN_PATH } from "@/lib/utils/constants"
import { adminLoginSchema, type AdminLoginInput } from "@/lib/validations/admin-login.schema"
import { isApiError } from "@/server/api/api-error"
import { clearSession, readSession, toSessionTokens, writeSession } from "@/server/api/admin-session"
import { loginRequest, logoutRequest } from "@/server/api/endpoints/admin-auth"
import { parseSetCookies } from "@/server/api/set-cookie-parser"
import type { HttpResponse } from "@/types/http-response.interface"

const LOGIN_ERROR_TITLE = "Não foi possível entrar"

/**
 * `POST /admin/auth/login` → grava os cookies de sessão → `/admin`.
 * Sem retry: o backend bloqueia a conta após 5 tentativas.
 */
export async function loginAdmin(input: AdminLoginInput): Promise<HttpResponse> {
  const parsed = adminLoginSchema.safeParse(input)
  if (!parsed.success) {
    return {
      status: 422,
      code: API_ERROR_CODE.INVALID_DATA,
      error: "Confira o e-mail e a senha.",
      title: LOGIN_ERROR_TITLE,
    }
  }

  try {
    const { data, headers } = await loginRequest(parsed.data.email, parsed.data.senha)
    const tokens = toSessionTokens(data, parseSetCookies(headers))
    if (!tokens) {
      return { status: 502, code: API_ERROR_CODE.UNKNOWN, error: getApiErrorMessage(undefined), title: LOGIN_ERROR_TITLE }
    }
    await writeSession(tokens)
  } catch (error) {
    if (isApiError(error)) {
      return { status: error.status, code: error.codigo, error: getApiErrorMessage(error.codigo), title: LOGIN_ERROR_TITLE }
    }
    // Sem o erro completo no log: pode carregar dados do request (LGPD).
    console.error("[loginAdmin]", error instanceof Error ? error.name : "erro desconhecido")
    return { status: 500, code: API_ERROR_CODE.UNKNOWN, error: getApiErrorMessage(undefined), title: LOGIN_ERROR_TITLE }
  }

  redirect(ADMIN_HOME_PATH)
}

/** `POST /admin/auth/logout` (erro ignorado: a sessão local sai de qualquer jeito) → limpa os cookies → login. */
export async function logoutAdmin(): Promise<void> {
  const { refreshToken, csrfToken } = await readSession()
  if (refreshToken && csrfToken) {
    try {
      await logoutRequest({ refreshToken, csrfToken })
    } catch {
      // A API pode já ter revogado a sessão; o importante é apagar os cookies daqui.
    }
  }
  await clearSession()
  redirect(ADMIN_LOGIN_PATH)
}
