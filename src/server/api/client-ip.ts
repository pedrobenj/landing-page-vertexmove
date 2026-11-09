import "server-only"

import { headers } from "next/headers"
import { unstable_rethrow } from "next/navigation"

/** `X-Forwarded-For` (primeiro IP) e `User-Agent` a repassar à API, lidos dos headers da request. */
export function pickForwardHeaders(incoming: Headers): Record<string, string> {
  const forwarded: Record<string, string> = {}
  const ip = incoming.get("x-forwarded-for")?.split(",")[0]?.trim() || incoming.get("x-real-ip")?.trim()
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
