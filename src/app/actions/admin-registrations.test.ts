import { beforeEach, describe, expect, it, vi } from "vitest"

import { ADMIN_ROLE } from "@/enums/admin-role.enum"
import { REGISTRATION_STATUS } from "@/enums/registration-status.enum"
import { ApiError } from "@/server/api/api-error"

const mocks = vi.hoisted(() => ({
  listAdminRegistrations: vi.fn(),
  markKitPickup: vi.fn(),
  undoKitPickup: vi.fn(),
  cancelAdminRegistration: vi.fn(),
  requireAdminSession: vi.fn(),
  revalidatePath: vi.fn(),
}))

vi.mock("next/navigation", () => ({ unstable_rethrow: () => {} }))
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }))
vi.mock("@/server/api/require-admin-session", () => ({ requireAdminSession: mocks.requireAdminSession }))
vi.mock("@/server/api/endpoints/admin-registrations", () => ({
  listAdminRegistrations: mocks.listAdminRegistrations,
  markKitPickup: mocks.markKitPickup,
  undoKitPickup: mocks.undoKitPickup,
  cancelAdminRegistration: mocks.cancelAdminRegistration,
}))

const { cancelAdminRegistrationAction, listAdminRegistrationsAction, setKitPickupAction } = await import("./admin-registrations")

const EMPTY = { items: [], nextCursor: null }
const BASE_FILTERS = { eventId: 1, status: "todos", distanciaId: null, busca: "", cursor: null } as const

describe("admin-registrations actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.requireAdminSession.mockResolvedValue({ id: 1, papel: ADMIN_ROLE.ADMIN })
  })

  describe("listAdminRegistrationsAction", () => {
    it("filtros vazios não vão à API", async () => {
      mocks.listAdminRegistrations.mockResolvedValue(EMPTY)
      expect(await listAdminRegistrationsAction(BASE_FILTERS)).toEqual({ status: 200, data: EMPTY })
      expect(mocks.listAdminRegistrations).toHaveBeenCalledWith(1, { status: undefined, distanciaId: undefined, busca: undefined, cursor: undefined })
    })

    it("repassa status, distância, busca aparada e cursor", async () => {
      mocks.listAdminRegistrations.mockResolvedValue(EMPTY)
      await listAdminRegistrationsAction({ eventId: 1, status: REGISTRATION_STATUS.CONFIRMED, distanciaId: 2, busca: "  ana ", cursor: "20" })
      expect(mocks.listAdminRegistrations).toHaveBeenCalledWith(1, { status: "confirmada", distanciaId: 2, busca: "ana", cursor: "20" })
    })

    it("entrada inválida → 422 sem chamar a API", async () => {
      expect(await listAdminRegistrationsAction({ ...BASE_FILTERS, status: "paga" as never })).toMatchObject({ status: 422 })
      expect(await listAdminRegistrationsAction({ ...BASE_FILTERS, eventId: 0 })).toMatchObject({ status: 422 })
      expect(await listAdminRegistrationsAction({ ...BASE_FILTERS, busca: "x".repeat(101) })).toMatchObject({ status: 422 })
      expect(mocks.listAdminRegistrations).not.toHaveBeenCalled()
    })

    it("erro da API vira HttpResponse com título", async () => {
      mocks.listAdminRegistrations.mockRejectedValue(new ApiError(404, "RECURSO_NAO_ENCONTRADO", "x"))
      expect(await listAdminRegistrationsAction(BASE_FILTERS)).toMatchObject({ status: 404, title: "Não foi possível carregar as inscrições" })
    })
  })

  describe("setKitPickupAction", () => {
    it("marca e desfaz a retirada, revalidando a lista e o detalhe", async () => {
      expect(await setKitPickupAction({ id: 7, eventId: 1, pickedUp: true })).toEqual({ status: 204 })
      expect(mocks.markKitPickup).toHaveBeenCalledWith(7)
      expect(await setKitPickupAction({ id: 7, eventId: 1, pickedUp: false })).toEqual({ status: 204 })
      expect(mocks.undoKitPickup).toHaveBeenCalledWith(7)
      expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/eventos/1/inscricoes")
      expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/eventos/1/inscricoes/7")
    })

    it("inscrição não confirmada (409) vira mensagem", async () => {
      mocks.markKitPickup.mockRejectedValue(new ApiError(409, "CONFLITO_DE_ESTADO", "x"))
      expect(await setKitPickupAction({ id: 7, eventId: 1, pickedUp: true })).toMatchObject({
        status: 409,
        code: "CONFLITO_DE_ESTADO",
        title: "Não foi possível registrar a retirada",
      })
    })

    it("papel só leitura → 403 sem chamar a API", async () => {
      mocks.requireAdminSession.mockResolvedValue({ id: 2, papel: ADMIN_ROLE.OPERATOR })
      expect(await setKitPickupAction({ id: 7, eventId: 1, pickedUp: true })).toMatchObject({ status: 403, code: "ACESSO_NEGADO" })
      expect(mocks.markKitPickup).not.toHaveBeenCalled()
    })

    it("id inválido → 422", async () => {
      expect(await setKitPickupAction({ id: -1, eventId: 1, pickedUp: true })).toMatchObject({ status: 422 })
    })
  })

  describe("cancelAdminRegistrationAction", () => {
    it("cancela e revalida", async () => {
      const cancelled = { id: 7, status: "cancelada", statusAnterior: "confirmada", estornoSinalizado: true, pagamentoId: 3 }
      mocks.cancelAdminRegistration.mockResolvedValue(cancelled)
      expect(await cancelAdminRegistrationAction({ id: 7, eventId: 1, motivo: "  pedido do atleta " })).toEqual({ status: 200, data: cancelled })
      expect(mocks.cancelAdminRegistration).toHaveBeenCalledWith(7, "pedido do atleta")
      expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/eventos/1/inscricoes/7")
      expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/pagamentos")
    })

    it("status que não permite cancelar (409) vira mensagem", async () => {
      mocks.cancelAdminRegistration.mockRejectedValue(new ApiError(409, "CONFLITO_DE_ESTADO", "x"))
      expect(await cancelAdminRegistrationAction({ id: 7, eventId: 1, motivo: "x" })).toMatchObject({ status: 409, title: "Não foi possível cancelar a inscrição" })
    })

    it("sem motivo ou com motivo longo → 422 no campo motivo", async () => {
      expect(await cancelAdminRegistrationAction({ id: 7, eventId: 1, motivo: "  " })).toMatchObject({ status: 422, field: "motivo" })
      expect(await cancelAdminRegistrationAction({ id: 7, eventId: 1, motivo: "x".repeat(501) })).toMatchObject({ status: 422, field: "motivo" })
      expect(mocks.cancelAdminRegistration).not.toHaveBeenCalled()
    })

    it("papel só leitura → 403", async () => {
      mocks.requireAdminSession.mockResolvedValue({ id: 2, papel: ADMIN_ROLE.OPERATOR })
      expect(await cancelAdminRegistrationAction({ id: 7, eventId: 1, motivo: "x" })).toMatchObject({ status: 403 })
      expect(mocks.cancelAdminRegistration).not.toHaveBeenCalled()
    })
  })
})
