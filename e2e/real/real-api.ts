import type { APIRequestContext } from "@playwright/test"

/** Backend real (o mesmo `API_URL` que o `playwright.real.config.ts` passa ao Next). */
export const REAL_API_URL = `${process.env.E2E_API_URL ?? "http://localhost:3000"}/api/v1`

/** GET direto no backend, para conferir a tela contra o que a API devolve. `null` em 404. */
export async function getFromApi<T>(request: APIRequestContext, path: string): Promise<T | null> {
  const response = await request.get(`${REAL_API_URL}${path}`)
  if (response.status() === 404) return null
  if (!response.ok()) throw new Error(`GET ${path} → ${response.status()}`)
  return (await response.json()) as T
}
