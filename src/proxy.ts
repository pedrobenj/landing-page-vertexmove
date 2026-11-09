/**
 * O proxy SÓ RENOVA a sessão; a autorização fica na camada de dados.
 *
 * Ele é pulado em prefetches (matcher abaixo) e qualquer mudança no matcher ou nas rotas pode deixar
 * caminhos de fora. Por isso toda página, componente ou server action do admin que leia ou altere dados
 * chama `requireAdminSession()` (src/server/api/require-admin-session.ts). O redirect daqui é só UX.
 * Ver node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md.
 */
import { type NextRequest, NextResponse } from "next/server"

import { ADMIN_LOGIN_PATH, ADMIN_SESSION_EXPIRED_PATH } from "@/lib/utils/constants"
import { applySessionToResponse, clearSessionOnResponse, SESSION_COOKIES } from "@/server/api/admin-session"
import { pickForwardHeaders } from "@/server/api/client-ip"
import { refreshSessionOnce } from "@/server/api/session-refresh-single-flight"

/**
 * Rotas do admin que não exigem sessão.
 *
 * O login NÃO redireciona ao painel só porque há cookie: um token revogado (cookie ainda válido) faria
 * login → /admin → 401 → login em loop. Quem já está logado entra pelo link "/admin".
 */
const OPEN_ADMIN_PATHS = new Set([ADMIN_LOGIN_PATH, ADMIN_SESSION_EXPIRED_PATH])

/**
 * Reforço do `missing` do matcher. O Next remove `next-router-prefetch` de `request.headers`
 * no proxy; por isso o filtro principal é o matcher.
 */
function isPrefetch(request: NextRequest): boolean {
  const { headers } = request
  return headers.get("purpose") === "prefetch" || headers.get("sec-purpose")?.includes("prefetch") === true
}

function redirectToLogin(request: NextRequest, clearCookies: boolean): NextResponse {
  const response = NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, request.url))
  if (clearCookies) clearSessionOnResponse(response)
  return response
}

/**
 * Renova o access token de `/admin/*` antes de expirar (CLAUDE.md §8) e manda ao login quem não tem
 * sessão. Server Components não gravam cookies, por isso a renovação fica aqui.
 */
export default async function proxy(request: NextRequest) {
  if (OPEN_ADMIN_PATHS.has(request.nextUrl.pathname)) return NextResponse.next()

  if (request.cookies.has(SESSION_COOKIES.access)) return NextResponse.next()

  const refreshToken = request.cookies.get(SESSION_COOKIES.refresh)?.value
  const csrfToken = request.cookies.get(SESSION_COOKIES.csrf)?.value
  if (!refreshToken || !csrfToken) return redirectToLogin(request, Boolean(refreshToken || csrfToken))

  // O refresh rotaciona o token: prefetch não renova (a página nega sem sessão via requireAdminSession).
  if (isPrefetch(request)) return NextResponse.next()

  // Single-flight: requisições concorrentes com o mesmo cookie compartilham o mesmo par novo.
  const tokens = await refreshSessionOnce(refreshToken, csrfToken, pickForwardHeaders(request.headers))
  if (!tokens) return redirectToLogin(request, true)

  // Atualiza o header `cookie` da própria requisição: o Server Component já lê o token novo agora.
  request.cookies.set(SESSION_COOKIES.access, tokens.accessToken)
  request.cookies.set(SESSION_COOKIES.refresh, tokens.refreshToken)
  request.cookies.set(SESSION_COOKIES.csrf, tokens.csrfToken)
  const response = NextResponse.next({ request: { headers: request.headers } })
  applySessionToResponse(response, tokens)
  return response
}

export const config = {
  matcher: [
    {
      source: "/admin/:path*",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
}
