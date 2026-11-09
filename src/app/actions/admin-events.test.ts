import { beforeEach, describe, expect, it, vi } from "vitest"

import { ADMIN_ROLE } from "@/enums/admin-role.enum"
import { EVENT_ACTION } from "@/enums/event-action.enum"
import { EVENT_STATUS } from "@/enums/event-status.enum"
import type { AdminEventFormInput } from "@/lib/validations/admin-event.schema"
import { ApiError } from "@/server/api/api-error"

const mocks = vi.hoisted(() => ({
  listAdminEvents: vi.fn(),
  getAdminEvent: vi.fn(),
  createAdminEvent: vi.fn(),
  updateAdminEvent: vi.fn(),
  deleteAdminEvent: vi.fn(),
  runEventAction: vi.fn(),
  requireAdminSession: vi.fn(),
  updateTag: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  unstable_rethrow: (error: unknown) => {
    if (error instanceof Error && error.message.startsWith("REDIRECT:")) throw error
  },
}))
vi.mock("next/cache", () => ({ updateTag: mocks.updateTag }))
vi.mock("@/server/api/require-admin-session", () => ({ requireAdminSession: mocks.requireAdminSession }))
vi.mock("@/server/api/endpoints/admin-events", () => ({
  listAdminEvents: mocks.listAdminEvents,
  getAdminEvent: mocks.getAdminEvent,
  createAdminEvent: mocks.createAdminEvent,
  updateAdminEvent: mocks.updateAdminEvent,
  deleteAdminEvent: mocks.deleteAdminEvent,
  runEventAction: mocks.runEventAction,
}))

const { createAdminEventAction, deleteAdminEventAction, listAdminEventsAction, runEventActionAction, updateAdminEventAction } =
  await import("./admin-events")

const form: AdminEventFormInput = {
  slug: "corrida-nova",
  nome: "Corrida Nova",
  descricao: "Descrição da corrida.",
  dataEvento: "2026-12-06",
  horarioLargada: "05:30",
  localNome: "Aterrinho",
  endereco: "",
  complemento: "",
  bairro: "",
  cidade: "Fortaleza",
  uf: "CE",
  cep: "",
  latitude: "",
  longitude: "",
  imagemCapaUrl: "",
  galeriaUrl: "",
}

const revalidatedTags = () => mocks.updateTag.mock.calls.map(([tag]) => tag)

describe("admin events actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.requireAdminSession.mockResolvedValue({ id: 1, papel: ADMIN_ROLE.ORGANIZATION })
  })

  describe("listAdminEventsAction", () => {
    it("todos → sem filtro de status; cursor nulo → primeira página", async () => {
      mocks.listAdminEvents.mockResolvedValue({ items: [], nextCursor: null })
      const response = await listAdminEventsAction({ status: "todos", cursor: null })
      expect(response).toEqual({ status: 200, data: { items: [], nextCursor: null } })
      expect(mocks.listAdminEvents).toHaveBeenCalledWith({ status: undefined, cursor: undefined })
    })

    it("repassa status e cursor", async () => {
      mocks.listAdminEvents.mockResolvedValue({ items: [], nextCursor: null })
      await listAdminEventsAction({ status: EVENT_STATUS.DRAFT, cursor: "10" })
      expect(mocks.listAdminEvents).toHaveBeenCalledWith({ status: EVENT_STATUS.DRAFT, cursor: "10" })
    })

    it("status inválido → 422 sem chamar a API", async () => {
      // @ts-expect-error status fora do enum
      const response = await listAdminEventsAction({ status: "qualquer", cursor: null })
      expect(response.status).toBe(422)
      expect(mocks.listAdminEvents).not.toHaveBeenCalled()
    })

    it("403 da API → mensagem de permissão", async () => {
      mocks.listAdminEvents.mockRejectedValue(new ApiError(403, "ACESSO_NEGADO", "Proibido"))
      const response = await listAdminEventsAction({ status: "todos", cursor: null })
      expect(response).toMatchObject({ status: 403, code: "ACESSO_NEGADO", error: "Você não tem permissão para realizar esta ação." })
    })

    it("relança o redirect do adminFetch (sessão expirada)", async () => {
      mocks.listAdminEvents.mockRejectedValue(new Error("REDIRECT:/admin/login"))
      await expect(listAdminEventsAction({ status: "todos", cursor: null })).rejects.toThrow("REDIRECT:/admin/login")
    })
  })

  describe("createAdminEventAction", () => {
    it("exige sessão antes de tudo", async () => {
      mocks.requireAdminSession.mockRejectedValueOnce(new Error("REDIRECT:/admin/login"))
      await expect(createAdminEventAction(form)).rejects.toThrow("REDIRECT:/admin/login")
      expect(mocks.createAdminEvent).not.toHaveBeenCalled()
    })

    it("falha de rede no GET /admin/me vira resposta de erro, não exceção", async () => {
      mocks.requireAdminSession.mockRejectedValueOnce(new ApiError(503, "INDISPONIVEL", "fora do ar"))
      const response = await createAdminEventAction(form)
      expect(response).toMatchObject({ status: 503, error: "Serviço indisponível no momento. Tente em alguns minutos." })
      expect(mocks.createAdminEvent).not.toHaveBeenCalled()
    })

    it("operador → 403 sem chamar a API", async () => {
      mocks.requireAdminSession.mockResolvedValue({ id: 2, papel: ADMIN_ROLE.OPERATOR })
      const response = await createAdminEventAction(form)
      expect(response).toMatchObject({ status: 403, code: "ACESSO_NEGADO" })
      expect(mocks.createAdminEvent).not.toHaveBeenCalled()
    })

    it("envia no formato da API e devolve 201", async () => {
      mocks.createAdminEvent.mockResolvedValue({ id: 9, slug: "corrida-nova" })
      const response = await createAdminEventAction(form)
      expect(response).toMatchObject({ status: 201, data: { id: 9 } })
      expect(mocks.createAdminEvent).toHaveBeenCalledWith(expect.objectContaining({ endereco: null, latitude: null, uf: "CE" }))
    })

    it("entrada inválida → 422 com o campo", async () => {
      const response = await createAdminEventAction({ ...form, uf: "Ceará" })
      expect(response).toMatchObject({ status: 422, field: "uf" })
      expect(mocks.createAdminEvent).not.toHaveBeenCalled()
    })

    it("slug duplicado (409) aponta para o campo slug", async () => {
      mocks.createAdminEvent.mockRejectedValue(new ApiError(409, "SLUG_DUPLICADO", "Já existe."))
      const response = await createAdminEventAction(form)
      expect(response).toMatchObject({ status: 409, field: "slug", error: "Já existe um evento com este endereço (slug)." })
    })

    it("422 da API no formato campo: mensagem preenche field", async () => {
      mocks.createAdminEvent.mockRejectedValue(new ApiError(422, "DADO_INVALIDO", "cep: CEP deve ter 8 dígitos."))
      const response = await createAdminEventAction(form)
      expect(response).toMatchObject({ status: 422, field: "cep", error: "CEP deve ter 8 dígitos." })
    })
  })

  describe("updateAdminEventAction", () => {
    it("troca de slug revalida o slug antigo, o novo e a lista", async () => {
      mocks.getAdminEvent.mockResolvedValue({ id: 3, slug: "slug-antigo" })
      mocks.updateAdminEvent.mockResolvedValue({ id: 3, slug: "corrida-nova" })
      const response = await updateAdminEventAction(3, form)
      expect(response.status).toBe(200)
      expect(revalidatedTags()).toEqual(["events", "event:slug-antigo", "event:corrida-nova"])
    })

    it("id inválido → 422", async () => {
      const response = await updateAdminEventAction(-1, form)
      expect(response.status).toBe(422)
      expect(mocks.getAdminEvent).not.toHaveBeenCalled()
    })

    it("404 da API → 404 sem revalidar", async () => {
      mocks.getAdminEvent.mockRejectedValue(new ApiError(404, "NAO_ENCONTRADO", "Evento não encontrado(a)."))
      const response = await updateAdminEventAction(99, form)
      expect(response.status).toBe(404)
      expect(mocks.updateTag).not.toHaveBeenCalled()
    })
  })

  describe("deleteAdminEventAction", () => {
    it("exclui e revalida o slug excluído", async () => {
      mocks.getAdminEvent.mockResolvedValue({ id: 3, slug: "corrida-x" })
      mocks.deleteAdminEvent.mockResolvedValue(undefined)
      const response = await deleteAdminEventAction(3)
      expect(response.status).toBe(204)
      expect(mocks.deleteAdminEvent).toHaveBeenCalledWith(3)
      expect(revalidatedTags()).toEqual(["events", "event:corrida-x"])
    })
  })

  describe("runEventActionAction", () => {
    it("despublicar revalida a página pública do evento", async () => {
      mocks.getAdminEvent.mockResolvedValue({ id: 1, slug: "corrida-x" })
      mocks.runEventAction.mockResolvedValue(undefined)
      const response = await runEventActionAction(1, EVENT_ACTION.UNPUBLISH)
      expect(response.status).toBe(204)
      expect(mocks.runEventAction).toHaveBeenCalledWith(1, EVENT_ACTION.UNPUBLISH)
      expect(revalidatedTags()).toEqual(["events", "event:corrida-x"])
    })

    it("ação desconhecida → 422", async () => {
      // @ts-expect-error ação fora do enum
      const response = await runEventActionAction(1, "arquivar")
      expect(response.status).toBe(422)
      expect(mocks.runEventAction).not.toHaveBeenCalled()
    })

    it("transição inválida → 422 com a mensagem amigável", async () => {
      mocks.getAdminEvent.mockResolvedValue({ id: 1, slug: "corrida-x" })
      mocks.runEventAction.mockRejectedValue(
        new ApiError(422, "TRANSICAO_INVALIDA", "Não é possível publicar um evento com status publicado."),
      )
      const response = await runEventActionAction(1, EVENT_ACTION.PUBLISH)
      expect(response).toMatchObject({ status: 422, error: "Esta ação não é permitida no status atual do evento." })
      expect(response.field).toBeUndefined()
    })
  })
})
