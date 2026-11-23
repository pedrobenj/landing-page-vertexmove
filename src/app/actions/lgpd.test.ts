import { beforeEach, describe, expect, it, vi } from "vitest"

import { LGPD_REQUEST_TYPE } from "@/enums/lgpd-request-type.enum"
import type { LgpdRequestFormInput } from "@/lib/validations/lgpd-request.schema"

const mockEnv = vi.hoisted(() => ({ NODE_ENV: "test", API_URL: "http://api.test", API_TIMEOUT_MS: 5_000, USE_MOCK_API: true }))
vi.mock("@/lib/env", () => ({ env: mockEnv }))
vi.mock("next/headers", () => ({ headers: async () => new Headers() }))

const { createLgpdRequestAction } = await import("./lgpd")
const { getMockDb, resetMockDb } = await import("@/server/api/mocks/mock-db")

const input: LgpdRequestFormInput = {
  tipo: LGPD_REQUEST_TYPE.DELETION,
  nomeCompleto: "Maria da Silva",
  cpf: "529.982.247-25",
  email: "maria@example.com",
  whatsapp: "",
  mensagem: "",
  aceite: true,
}

describe("createLgpdRequestAction", () => {
  beforeEach(() => resetMockDb())

  it("202 → devolve só o protocolo e o prazo, e grava o corpo normalizado", async () => {
    const response = await createLgpdRequestAction(input)
    expect(response.status).toBe(202)
    expect(response.data).toEqual({ protocolo: expect.stringMatching(/^LGPD-\d{4}-[0-9A-Z]{8}$/), prazoEm: expect.any(String) })
    expect(getMockDb().lgpdRequests.at(-1)).toMatchObject({ cpf: "52998224725", whatsapp: null, mensagem: null, tipo: "eliminacao" })
  })

  it("entrada inválida → 422 com o campo, sem chamar a API", async () => {
    const before = getMockDb().lgpdRequests.length
    const response = await createLgpdRequestAction({ ...input, cpf: "123", aceite: false })
    expect(response).toMatchObject({ status: 422, code: "DADO_INVALIDO", field: "cpf" })
    expect(getMockDb().lgpdRequests).toHaveLength(before)
  })
})
