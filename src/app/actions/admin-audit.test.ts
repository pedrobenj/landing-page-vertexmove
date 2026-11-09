import { beforeEach, describe, expect, it, vi } from "vitest"

import { ApiError } from "@/server/api/api-error"

const mocks = vi.hoisted(() => ({ listAudit: vi.fn() }))

vi.mock("next/navigation", () => ({
  unstable_rethrow: (error: unknown) => {
    if (error instanceof Error && error.message.startsWith("REDIRECT:")) throw error
  },
}))
vi.mock("@/server/api/endpoints/audit", () => ({ listAudit: mocks.listAudit }))

const { listAuditAction } = await import("./admin-audit")

describe("listAuditAction", () => {
  beforeEach(() => vi.clearAllMocks())

  it("repassa o cursor (null → primeira página)", async () => {
    mocks.listAudit.mockResolvedValue({ items: [], nextCursor: null })
    await listAuditAction({ cursor: null })
    expect(mocks.listAudit).toHaveBeenCalledWith({ cursor: undefined })
    await listAuditAction({ cursor: "40" })
    expect(mocks.listAudit).toHaveBeenLastCalledWith({ cursor: "40" })
  })

  it("cursor inválido → 422 sem chamar a API", async () => {
    expect((await listAuditAction({ cursor: "" })).status).toBe(422)
    expect(mocks.listAudit).not.toHaveBeenCalled()
  })

  it("erro da API vira resposta; redirect sobe", async () => {
    mocks.listAudit.mockRejectedValueOnce(new ApiError(403, "ACESSO_NEGADO", "x"))
    expect((await listAuditAction({ cursor: null })).status).toBe(403)
    mocks.listAudit.mockRejectedValueOnce(new Error("REDIRECT:/admin/login"))
    await expect(listAuditAction({ cursor: null })).rejects.toThrow("REDIRECT:/admin/login")
  })
})
