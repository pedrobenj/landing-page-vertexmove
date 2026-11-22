import { afterEach, describe, expect, it, vi } from "vitest"

async function loadEnv(vars: Record<string, string | undefined>) {
  vi.resetModules()
  for (const [key, value] of Object.entries(vars)) vi.stubEnv(key, value)
  return (await import("./env")).env
}

describe("env: BFF_SHARED_SECRET", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("é opcional (ausente ou vazio vira undefined)", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    expect((await loadEnv({ BFF_SHARED_SECRET: undefined })).BFF_SHARED_SECRET).toBeUndefined()
    expect((await loadEnv({ BFF_SHARED_SECRET: "" })).BFF_SHARED_SECRET).toBeUndefined()
  })

  it("aceita 32 caracteres ou mais", async () => {
    const secret = "a".repeat(32)
    expect((await loadEnv({ BFF_SHARED_SECRET: secret })).BFF_SHARED_SECRET).toBe(secret)
  })

  it("recusa segredo curto", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    await expect(loadEnv({ BFF_SHARED_SECRET: "curto" })).rejects.toThrow(/Variáveis de ambiente inválidas/)
  })
})
