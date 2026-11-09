import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({ getMe: vi.fn() }))

vi.mock("./endpoints/admin-auth", () => ({ getMe: mocks.getMe }))

const { requireAdminSession } = await import("./require-admin-session")

describe("requireAdminSession", () => {
  beforeEach(() => {
    mocks.getMe.mockReset()
  })

  it("devolve o perfil do admin logado", async () => {
    mocks.getMe.mockResolvedValue({ id: 1, nome: "Ana", email: "a@x.com", papel: "ADMIN", mfaAtivo: false })
    await expect(requireAdminSession()).resolves.toMatchObject({ id: 1, nome: "Ana" })
  })

  it("propaga o redirect do adminFetch quando não há sessão", async () => {
    mocks.getMe.mockRejectedValue(new Error("REDIRECT:/admin/login"))
    await expect(requireAdminSession()).rejects.toThrow("REDIRECT:/admin/login")
  })
})
