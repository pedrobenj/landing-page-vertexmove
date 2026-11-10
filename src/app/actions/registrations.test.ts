import { beforeEach, describe, expect, it, vi } from "vitest"

import { API_ERROR_CODE } from "@/enums/api-error-code.enum"
import { REGISTRATION_STATUS } from "@/enums/registration-status.enum"
import type { CreateRegistrationInput } from "@/types/api/registration.interface"

const mockEnv = vi.hoisted(() => ({ NODE_ENV: "test", API_URL: "http://api.test", API_TIMEOUT_MS: 5_000, USE_MOCK_API: true }))

vi.mock("@/lib/env", () => ({ env: mockEnv }))
vi.mock("next/headers", () => ({ headers: async () => new Headers() }))

const { createRegistrationAction, downloadRegistrationReceiptAction, getRegistrationReceiptAction, lookupRegistrationsAction } =
  await import("./registrations")
const { resetMockDb } = await import("@/server/api/mocks/mock-db")

const input: CreateRegistrationInput = {
  eventoSlug: "corrida-vertex-beira-mar-2026",
  distanciaId: 1,
  kitId: 1,
  tamanhoCamisaId: 3,
  nomeCompleto: "Maria da Silva",
  dataNascimento: "1990-12-06",
  cpf: "52998224725",
  whatsapp: "+5585999990000",
  documentosAceitos: [101, 102],
}

describe("createRegistrationAction", () => {
  beforeEach(() => resetMockDb())

  it("201 → devolve o código e os valores calculados pela API", async () => {
    const response = await createRegistrationAction(input)
    expect(response.status).toBe(201)
    expect(response.data).toMatchObject({
      codigo: expect.stringMatching(/^VX-\d{4}-\d{8}$/),
      status: REGISTRATION_STATUS.PENDING,
      // Lote (R$ 89,90) + Kit Camisa + Medalha (R$ 50,00).
      valorBaseCentavos: 13990,
      valorDescontoCentavos: 0,
      valorTotalCentavos: 13990,
    })
  })

  it("409 INSCRICAO_DUPLICADA → status, código e mensagem amigável", async () => {
    await createRegistrationAction(input)
    const response = await createRegistrationAction(input)
    expect(response).toMatchObject({
      status: 409,
      code: API_ERROR_CODE.DUPLICATE_REGISTRATION,
      error: "Já existe uma inscrição para este atleta nesta distância.",
      title: "Não foi possível concluir a inscrição",
    })
  })

  it("sem os documentos obrigatórios → DOCUMENTO_ACEITE_OBRIGATORIO", async () => {
    const response = await createRegistrationAction({ ...input, documentosAceitos: [101] })
    expect(response).toMatchObject({ status: 422, code: API_ERROR_CODE.DOCUMENT_ACCEPTANCE_REQUIRED })
  })

  it("valida o corpo antes de chamar a API", async () => {
    const response = await createRegistrationAction({ ...input, cpf: undefined, whatsapp: undefined })
    expect(response).toMatchObject({ status: 422, code: API_ERROR_CODE.INVALID_DATA })
  })
})

describe("lookupRegistrationsAction", () => {
  beforeEach(() => resetMockDb())

  it("consulta por CPF mascarado e devolve o nome mascarado", async () => {
    await createRegistrationAction(input)
    const response = await lookupRegistrationsAction({ tipo: "cpf", valor: "529.982.247-25" })
    expect(response.status).toBe(200)
    expect(response.data?.items).toHaveLength(1)
    expect(response.data?.items[0]).toMatchObject({ evento: "Corrida Vertex Beira-Mar 2026", distancia: "5 km" })
    expect(response.data?.items[0]?.nomeMascarado).not.toContain("Silva")
  })

  it("consulta por WhatsApp com máscara (converte para E.164)", async () => {
    await createRegistrationAction(input)
    const response = await lookupRegistrationsAction({ tipo: "whatsapp", valor: "(85) 99999-0000" })
    expect(response.data?.items).toHaveLength(1)
  })

  it("sem inscrições → lista vazia (não revela se o CPF existe)", async () => {
    const response = await lookupRegistrationsAction({ tipo: "cpf", valor: "529.982.247-25" })
    expect(response).toEqual({ status: 200, data: { items: [], nextCursor: null } })
  })

  it("entrada inválida → 422 com a mensagem do schema", async () => {
    const response = await lookupRegistrationsAction({ tipo: "cpf", valor: "111.111.111-11" })
    expect(response).toMatchObject({ status: 422, code: API_ERROR_CODE.INVALID_DATA, error: "CPF inválido" })
  })

  describe("comprovante", () => {
    async function lookupReference(): Promise<string> {
      await createRegistrationAction(input)
      const response = await lookupRegistrationsAction({ tipo: "cpf", valor: "529.982.247-25" })
      return response.data!.items[0].referencia
    }

    it("libera os dados com a data de nascimento certa (DD/MM/AAAA)", async () => {
      const referencia = await lookupReference()
      const response = await getRegistrationReceiptAction({ referencia, dataNascimento: "06/12/1990" })
      expect(response.status).toBe(200)
      expect(response.data).toMatchObject({ nomeCompleto: "Maria da Silva", kit: "Kit Camisa + Medalha", valorTotalCentavos: 13990 })
    })

    it("nascimento errado → 404 com mensagem própria", async () => {
      const referencia = await lookupReference()
      const response = await getRegistrationReceiptAction({ referencia, dataNascimento: "07/12/1990" })
      expect(response).toMatchObject({
        status: 404,
        error: "A data de nascimento não confere com a inscrição. Confira e tente de novo.",
      })
    })

    it("data inválida → 422 sem chamar a API", async () => {
      const response = await getRegistrationReceiptAction({ referencia: "x", dataNascimento: "31/02/1990" })
      expect(response.status).toBe(422)
    })

    it("devolve o PDF em base64 com o nome do arquivo", async () => {
      const referencia = await lookupReference()
      const response = await downloadRegistrationReceiptAction({ referencia, dataNascimento: "06/12/1990" })
      expect(response.status).toBe(200)
      expect(response.data!.fileName).toMatch(/^comprovante-VX-\d{4}-\d{8}\.pdf$/)
      expect(Buffer.from(response.data!.base64, "base64").subarray(0, 5).toString()).toBe("%PDF-")
    })
  })
})
