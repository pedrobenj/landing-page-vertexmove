import { beforeEach, describe, expect, it, vi } from "vitest"

import { ADMIN_ROLE } from "@/enums/admin-role.enum"

const mocks = vi.hoisted(() => ({
  requireAdminSession: vi.fn(),
  createManagedAdmin: vi.fn(),
  deactivateManagedAdmin: vi.fn(),
  reactivateManagedAdmin: vi.fn(),
  resetManagedAdminPassword: vi.fn(),
  changeOwnPassword: vi.fn(),
  clearSession: vi.fn(),
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`)
  }),
}))

vi.mock("next/navigation", () => ({ unstable_rethrow: () => {}, redirect: mocks.redirect }))
vi.mock("@/server/api/require-admin-session", () => ({ requireAdminSession: mocks.requireAdminSession }))
vi.mock("@/server/api/admin-session", () => ({ clearSession: mocks.clearSession }))
vi.mock("@/server/api/endpoints/admin-management", () => ({
  createManagedAdmin: mocks.createManagedAdmin,
  deactivateManagedAdmin: mocks.deactivateManagedAdmin,
  reactivateManagedAdmin: mocks.reactivateManagedAdmin,
  resetManagedAdminPassword: mocks.resetManagedAdminPassword,
  changeOwnPassword: mocks.changeOwnPassword,
}))

const actions = await import("./admin-management")
const { ApiError } = await import("@/server/api/api-error")

const admin = { id: 7, nome: "Maria", email: "maria@vertex.com.br", papel: "admin", ativo: true, ultimoAcessoEm: null, criadoEm: "2026-11-22T15:00:00.000Z" }
const password = { senhaAtual: "Vertex@Dev12345", novaSenha: "Nova senha forte 2026", confirmacao: "Nova senha forte 2026" }

describe("actions de gestão de admins", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.requireAdminSession.mockResolvedValue({ id: 1, papel: ADMIN_ROLE.ADMIN })
  })

  it("cria e devolve a senha temporária uma vez", async () => {
    mocks.createManagedAdmin.mockResolvedValue({ admin, senhaTemporaria: "a".repeat(24) })
    const response = await actions.createAdminAction({ nome: "Maria", email: "Maria@Vertex.com.br" })
    expect(response).toMatchObject({ status: 201, data: { admin, senhaTemporaria: "a".repeat(24) }, title: "Admin criado" })
    expect(mocks.createManagedAdmin).toHaveBeenCalledWith({ nome: "Maria", email: "maria@vertex.com.br" })
  })

  it("e-mail em uso (409) aponta o campo email", async () => {
    mocks.createManagedAdmin.mockRejectedValue(new ApiError(409, "ADMIN_EMAIL_EM_USO", "em uso"))
    expect(await actions.createAdminAction({ nome: "Maria", email: "maria@vertex.com.br" })).toMatchObject({
      status: 409,
      field: "email",
      error: "Já existe um admin com este e-mail.",
    })
  })

  it("desativar, reativar e redefinir validam o id e tratam 409", async () => {
    mocks.deactivateManagedAdmin.mockResolvedValue({ ...admin, ativo: false })
    expect(await actions.deactivateAdminAction(7)).toMatchObject({ status: 200, data: { ativo: false }, title: "Admin desativado" })
    mocks.reactivateManagedAdmin.mockResolvedValue(admin)
    expect(await actions.reactivateAdminAction(7)).toMatchObject({ status: 200, title: "Admin reativado" })
    mocks.resetManagedAdminPassword.mockResolvedValue({ senhaTemporaria: "b".repeat(24) })
    expect(await actions.resetAdminPasswordAction(7)).toMatchObject({ status: 200, data: { senhaTemporaria: "b".repeat(24) } })

    mocks.deactivateManagedAdmin.mockRejectedValue(new ApiError(409, "ULTIMO_ADMIN_ATIVO", "último"))
    expect(await actions.deactivateAdminAction(7)).toMatchObject({ status: 409, error: "Não é possível desativar o último admin ativo." })
    expect(await actions.resetAdminPasswordAction(0)).toMatchObject({ status: 422 })
    expect(mocks.resetManagedAdminPassword).toHaveBeenCalledTimes(1)
  })

  it("papel sem permissão não gerencia admins", async () => {
    mocks.requireAdminSession.mockResolvedValue({ id: 2, papel: ADMIN_ROLE.OPERATOR })
    expect(await actions.createAdminAction({ nome: "Maria", email: "maria@vertex.com.br" })).toMatchObject({ status: 403 })
    expect(await actions.deactivateAdminAction(7)).toMatchObject({ status: 403 })
    expect(mocks.createManagedAdmin).not.toHaveBeenCalled()
  })

  it("trocar a própria senha: 204 → limpa a sessão e vai ao login com aviso", async () => {
    mocks.changeOwnPassword.mockResolvedValue(undefined)
    await expect(actions.changeOwnPasswordAction(password)).rejects.toThrow("REDIRECT:/admin/login?senha-alterada=1")
    expect(mocks.changeOwnPassword).toHaveBeenCalledWith({ senhaAtual: password.senhaAtual, novaSenha: password.novaSenha })
    expect(mocks.clearSession).toHaveBeenCalled()
  })

  it("trocar a própria senha: senha atual errada e regra do backend viram erro no campo", async () => {
    mocks.changeOwnPassword.mockRejectedValueOnce(new ApiError(422, "SENHA_ATUAL_INCORRETA", "não confere"))
    expect(await actions.changeOwnPasswordAction(password)).toMatchObject({ status: 422, field: "senhaAtual", error: "A senha atual não confere." })
    mocks.changeOwnPassword.mockRejectedValueOnce(new ApiError(422, "DADO_INVALIDO", "inválido", "novaSenha", undefined, "senha_obvia"))
    expect(await actions.changeOwnPasswordAction(password)).toMatchObject({
      status: 422,
      field: "novaSenha",
      error: "Essa senha é fácil de adivinhar. Escolha outra.",
    })
    expect(mocks.clearSession).not.toHaveBeenCalled()
    expect(await actions.changeOwnPasswordAction({ ...password, confirmacao: "x" })).toMatchObject({ status: 422, field: "confirmacao" })
  })
})
