import "server-only"

import { cookies } from "next/headers"

/** O token não expira no backend. O cookie dura 60 dias: cobre a reserva, o pagamento e a consulta até a prova. */
const REGISTRATION_ACCESS_MAX_AGE_S = 60 * 24 * 60 * 60

/** Um cookie por inscrição: o mesmo navegador pode ter feito várias (família no mesmo WhatsApp). */
export function registrationCookieName(codigo: string): string {
  return `vm_insc_${codigo}`
}

/** Guarda o `accessToken` de `POST /inscricoes`. HttpOnly: o navegador nunca lê o token. */
export async function saveRegistrationAccess(codigo: string, accessToken: string): Promise<void> {
  const store = await cookies()
  store.set(registrationCookieName(codigo), accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: REGISTRATION_ACCESS_MAX_AGE_S,
  })
}

export async function getRegistrationAccessToken(codigo: string): Promise<string | null> {
  return (await cookies()).get(registrationCookieName(codigo))?.value ?? null
}
