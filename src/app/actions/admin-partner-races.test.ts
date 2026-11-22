import { beforeEach, describe, expect, it, vi } from "vitest"

import { ADMIN_ROLE } from "@/enums/admin-role.enum"
import type { PartnerRaceFormInput } from "@/lib/validations/partner-race.schema"

const mocks = vi.hoisted(() => ({
  requireAdminSession: vi.fn(),
  createPartnerRace: vi.fn(),
  updatePartnerRace: vi.fn(),
  deletePartnerRace: vi.fn(),
  updateTag: vi.fn(),
}))

vi.mock("next/navigation", () => ({ unstable_rethrow: () => {} }))
vi.mock("next/cache", () => ({ updateTag: mocks.updateTag }))
vi.mock("@/server/api/require-admin-session", () => ({ requireAdminSession: mocks.requireAdminSession }))
vi.mock("@/server/api/endpoints/admin-partner-races", () => ({
  createPartnerRace: mocks.createPartnerRace,
  updatePartnerRace: mocks.updatePartnerRace,
  deletePartnerRace: mocks.deletePartnerRace,
}))
vi.mock("@/server/api/endpoints/partner-races", () => ({ PARTNER_RACES_TAG: "partner-races" }))

const { deletePartnerRaceAction, savePartnerRaceAction, setPartnerRaceActiveAction } = await import("./admin-partner-races")
const { ApiError } = await import("@/server/api/api-error")

const input: PartnerRaceFormInput = {
  nome: "Corrida do Farol",
  dataEvento: "2027-04-18",
  localNome: "Farol do Mucuripe",
  cidade: "Fortaleza",
  uf: "ce",
  distancias: "5 km, 10 km",
  cupom: "VERTEX15",
  descontoPercentual: "15",
  realizacao: "",
  urlInscricao: "https://example.com/farol",
  imagemCapaUrl: "",
  ordem: "0",
  ativo: true,
}
const tags = () => mocks.updateTag.mock.calls.map(([tag]) => tag)

describe("actions de corridas parceiras", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.requireAdminSession.mockResolvedValue({ id: 1, papel: ADMIN_ROLE.ADMIN })
  })

  it("cria com o corpo da API, revalida a vitrine e devolve o id", async () => {
    mocks.createPartnerRace.mockResolvedValue({ id: 7 })
    const response = await savePartnerRaceAction(input)
    expect(response).toMatchObject({ status: 201, data: { id: 7 }, title: "Corrida parceira cadastrada" })
    expect(mocks.createPartnerRace).toHaveBeenCalledWith(
      expect.objectContaining({ uf: "CE", distancias: ["5 km", "10 km"], descontoPercentual: 15, realizacao: null, imagemCapaUrl: null }),
    )
    expect(tags()).toEqual(["partner-races"])
  })

  it("edita pelo id (PATCH com o corpo inteiro)", async () => {
    mocks.updatePartnerRace.mockResolvedValue({ id: 3 })
    const response = await savePartnerRaceAction(input, 3)
    expect(response).toMatchObject({ status: 200, data: { id: 3 }, title: "Corrida parceira atualizada" })
    expect(mocks.updatePartnerRace).toHaveBeenCalledWith(3, expect.objectContaining({ cupom: "VERTEX15", ordem: 0 }))
  })

  it("entrada ou id inválidos → 422 sem chamar a API", async () => {
    expect(await savePartnerRaceAction({ ...input, urlInscricao: "http://x.com" })).toMatchObject({ status: 422, field: "urlInscricao" })
    expect(await savePartnerRaceAction(input, 0)).toMatchObject({ status: 422 })
    expect(await setPartnerRaceActiveAction(-1, true)).toMatchObject({ status: 422 })
    expect(await deletePartnerRaceAction(Number.NaN)).toMatchObject({ status: 422 })
    expect(mocks.createPartnerRace).not.toHaveBeenCalled()
    expect(mocks.updatePartnerRace).not.toHaveBeenCalled()
    expect(mocks.deletePartnerRace).not.toHaveBeenCalled()
  })

  it("422 do backend com detalhes[].campo aponta o campo", async () => {
    mocks.createPartnerRace.mockRejectedValue(new ApiError(422, "DADO_INVALIDO", "Dados inválidos", "urlInscricao"))
    expect(await savePartnerRaceAction(input)).toMatchObject({ status: 422, field: "urlInscricao" })
    expect(tags()).toEqual([])
  })

  it("ativar/desativar manda só { ativo } e revalida", async () => {
    mocks.updatePartnerRace.mockResolvedValue({ id: 2, ativo: false })
    const response = await setPartnerRaceActiveAction(2, false)
    expect(response).toMatchObject({ status: 200, title: "Corrida parceira desativada" })
    expect(mocks.updatePartnerRace).toHaveBeenCalledWith(2, { ativo: false })
    expect(tags()).toEqual(["partner-races"])
    expect(await setPartnerRaceActiveAction(2, true)).toMatchObject({ title: "Corrida parceira ativada" })
  })

  it("exclui (204) e 404 vira mensagem amigável", async () => {
    mocks.deletePartnerRace.mockResolvedValue(undefined)
    expect(await deletePartnerRaceAction(5)).toMatchObject({ status: 204, title: "Corrida parceira excluída" })
    expect(mocks.deletePartnerRace).toHaveBeenCalledWith(5)
    mocks.deletePartnerRace.mockRejectedValue(new ApiError(404, "RECURSO_NAO_ENCONTRADO", "não encontrada"))
    expect(await deletePartnerRaceAction(5)).toMatchObject({ status: 404, code: "RECURSO_NAO_ENCONTRADO" })
  })

  it("papel sem permissão não altera (403 sem chamar a API)", async () => {
    mocks.requireAdminSession.mockResolvedValue({ id: 2, papel: ADMIN_ROLE.OPERATOR })
    expect(await savePartnerRaceAction(input)).toMatchObject({ status: 403 })
    expect(await deletePartnerRaceAction(1)).toMatchObject({ status: 403 })
    expect(mocks.createPartnerRace).not.toHaveBeenCalled()
    expect(mocks.deletePartnerRace).not.toHaveBeenCalled()
  })
})
