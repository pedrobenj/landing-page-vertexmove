import "server-only"

import { env } from "@/lib/env"

export type Transport = (url: string, init: RequestInit) => Promise<Response>

export async function getTransport(): Promise<Transport> {
  if (!env.USE_MOCK_API) return fetch
  const { mockFetch } = await import("./mocks/mock-fetch")
  return mockFetch
}
