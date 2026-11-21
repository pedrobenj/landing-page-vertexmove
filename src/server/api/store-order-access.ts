import "server-only"

import { cookies } from "next/headers"

/** Margem depois do fim da reserva: cobre o retorno do Mercado Pago e a confirmação do webhook. */
const ACCESS_MARGIN_S = 60 * 60

/** Um cookie por pedido (o mesmo navegador pode ter vários). */
export function storeOrderCookieName(codigo: string): string {
  return `vm_pedido_${codigo}`
}

/**
 * Guarda o `accessToken` de `POST /loja/pedidos` (decisão L4: o código basta para o resumo, pagar exige
 * o token). HttpOnly: o navegador nunca lê o token. Dura até `expiraEm` + 1 h.
 */
export async function saveStoreOrderAccess(codigo: string, accessToken: string, expiraEm: string, now = new Date()): Promise<void> {
  const remainingS = Math.max(0, Math.floor((Date.parse(expiraEm) - now.getTime()) / 1000)) || 0
  const store = await cookies()
  store.set(storeOrderCookieName(codigo), accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: remainingS + ACCESS_MARGIN_S,
  })
}

export async function getStoreOrderAccessToken(codigo: string): Promise<string | null> {
  return (await cookies()).get(storeOrderCookieName(codigo))?.value ?? null
}
