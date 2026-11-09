import { type NextRequest, NextResponse } from "next/server"

import { ADMIN_LOGIN_PATH, ADMIN_SESSION_EXPIRED_PARAM } from "@/lib/utils/constants"
import { clearSessionOnResponse } from "@/server/api/admin-session"

/**
 * Destino do `adminFetch` quando a API responde 401 (token revogado): apaga os cookies de sessão e
 * manda ao login com o aviso de sessão expirada. Sem isso, o cookie velho continuaria no browser.
 *
 * Só apaga cookies locais (não chama a API), então um GET forjado no máximo desloga o admin.
 */
export function GET(request: NextRequest) {
  const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url)
  loginUrl.searchParams.set(ADMIN_SESSION_EXPIRED_PARAM, "1")

  const response = NextResponse.redirect(loginUrl)
  response.headers.set("Cache-Control", "no-store")
  clearSessionOnResponse(response)
  return response
}
