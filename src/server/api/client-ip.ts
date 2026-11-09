import "server-only"

import { headers } from "next/headers"
import { unstable_rethrow } from "next/navigation"

/**
 * IP e User-Agent do atleta, para o rate limit do backend valer por pessoa e não pelo IP do servidor.
 * Fora de uma request (build, `"use cache"`) devolve `{}`.
 */
export async function getForwardHeaders(): Promise<Record<string, string>> {
  try {
    const incoming = await headers()
    const forwarded: Record<string, string> = {}
    const ip = incoming.get("x-forwarded-for")?.split(",")[0]?.trim() || incoming.get("x-real-ip")?.trim()
    const userAgent = incoming.get("user-agent")
    if (ip) forwarded["X-Forwarded-For"] = ip
    if (userAgent) forwarded["User-Agent"] = userAgent
    return forwarded
  } catch (error) {
    unstable_rethrow(error)
    return {}
  }
}
