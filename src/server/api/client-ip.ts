import "server-only"

import { headers } from "next/headers"
import { unstable_rethrow } from "next/navigation"

/**
 * IP do cliente e `User-Agent` a repassar à API (como `X-Forwarded-For`), lidos dos headers da request.
 *
 * Premissa: o app roda atrás de um proxy confiável (Vercel), que define `x-real-ip` com o IP real e
 * sobrescreve o que o cliente mandar. O primeiro item do `x-forwarded-for` pode vir forjado pelo cliente
 * em outros ambientes, então só é usado sem `x-real-ip` (ex.: `next dev`/`next start` local). Se o deploy
 * sair da Vercel, confirmar qual header o proxy da frente garante.
 */
export function pickForwardHeaders(incoming: Headers): Record<string, string> {
  const forwarded: Record<string, string> = {}
  const ip = incoming.get("x-real-ip")?.trim() || incoming.get("x-forwarded-for")?.split(",")[0]?.trim()
  const userAgent = incoming.get("user-agent")
  if (ip) forwarded["X-Forwarded-For"] = ip
  if (userAgent) forwarded["User-Agent"] = userAgent
  return forwarded
}

/**
 * IP e User-Agent do atleta, para o rate limit do backend valer por pessoa e não pelo IP do servidor.
 * Fora de uma request (build, `"use cache"`) devolve `{}`.
 */
export async function getForwardHeaders(): Promise<Record<string, string>> {
  try {
    return pickForwardHeaders(await headers())
  } catch (error) {
    unstable_rethrow(error)
    return {}
  }
}
