import "server-only"

import { headers } from "next/headers"

import { createRateLimiter } from "./rate-limit"

const globalForRateLimit = globalThis as unknown as { isLimited?: ReturnType<typeof createRateLimiter> }
const isLimited = (globalForRateLimit.isLimited ??= createRateLimiter())

/** Rate limit por IP para server actions. */
export async function isRequestRateLimited(scope: string, limit: number, windowMs: number): Promise<boolean> {
  const forwardedFor = (await headers()).get("x-forwarded-for")
  const ip = forwardedFor?.split(",")[0]?.trim() || "unknown"
  return isLimited(`${scope}:${ip}`, limit, windowMs)
}
