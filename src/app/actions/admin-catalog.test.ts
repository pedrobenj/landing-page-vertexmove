import { beforeEach, describe, expect, it, vi } from "vitest"

import { ADMIN_ROLE } from "@/enums/admin-role.enum"
import { DOCUMENT_TYPE } from "@/enums/document-type.enum"
import type { DocumentFormInput } from "@/lib/validations/document.schema"

const mocks = vi.hoisted(() => ({
  requireAdminSession: vi.fn(),
  getAdminEvent: vi.fn(),
  createDocument: vi.fn(),
  createShirtSize: vi.fn(),
  updateShirtSize: vi.fn(),
  updateTag: vi.fn(),
}))

vi.mock("next/navigation", () => ({ unstable_rethrow: () => {} }))
vi.mock("next/cache", () => ({ updateTag: mocks.updateTag }))
vi.mock("@/server/api/require-admin-session", () => ({ requireAdminSession: mocks.requireAdminSession }))
vi.mock("@/server/api/endpoints/admin-events", () => ({ getAdminEvent: mocks.getAdminEvent }))
vi.mock("@/server/api/endpoints/documents", () => ({ createDocument: mocks.createDocument }))
vi.mock("@/server/api/endpoints/shirt-sizes", () => ({
  createShirtSize: mocks.createShirtSize,
  updateShirtSize: mocks.updateShirtSize,
}))

const { createDocumentAction } = await import("./admin-documents")
const { createShirtSizeAction, updateShirtSizeAction } = await import("./admin-shirt-sizes")

const document: DocumentFormInput = {
  tipo: DOCUMENT_TYPE.LIABILITY_TERM,
  versao: "2.0",
  titulo: "Termo",
  url: "https://cdn.example.com/termo.pdf",
  hashSha256: "f".repeat(64),
  vigenteEm: "2026-11-10T00:00",
}
const tags = () => mocks.updateTag.mock.calls.map(([tag]) => tag)

describe("documentos e tamanhos de camisa", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.requireAdminSession.mockResolvedValue({ id: 1, papel: ADMIN_ROLE.ORGANIZATION })
    mocks.getAdminEvent.mockResolvedValue({ id: 4, slug: "corrida-x" })
  })

  it("nova versão usa o eventoId da corrida lida no servidor e revalida o slug", async () => {
    mocks.createDocument.mockResolvedValue({ id: 50 })
    const response = await createDocumentAction(4, document)
    expect(response.status).toBe(201)
    expect(mocks.createDocument).toHaveBeenCalledWith(
      expect.objectContaining({ eventoId: 4, tipo: DOCUMENT_TYPE.LIABILITY_TERM, vigenteEm: "2026-11-10T00:00:00-03:00" }),
    )
    expect(tags()).toEqual(["events", "event:corrida-x"])
  })

  it("hash inválido → 422 no campo", async () => {
    const response = await createDocumentAction(4, { ...document, hashSha256: "123" })
    expect(response).toMatchObject({ status: 422, field: "hashSha256" })
    expect(mocks.createDocument).not.toHaveBeenCalled()
  })

  it("tamanho: cria em maiúsculas e revalida todas as corridas", async () => {
    mocks.createShirtSize.mockResolvedValue({ id: 9 })
    const response = await createShirtSizeAction({ codigo: "xxgg", descricao: "", ordem: "7", ativo: true })
    expect(response.status).toBe(201)
    expect(mocks.createShirtSize).toHaveBeenCalledWith({ codigo: "XXGG", descricao: null, ordem: 7, ativo: true })
    expect(tags()).toEqual(["events"])
  })

  it("operador não altera tamanhos", async () => {
    mocks.requireAdminSession.mockResolvedValue({ id: 2, papel: ADMIN_ROLE.OPERATOR })
    const response = await updateShirtSizeAction(1, { codigo: "P", descricao: "", ordem: "1", ativo: true })
    expect(response.status).toBe(403)
    expect(mocks.updateShirtSize).not.toHaveBeenCalled()
  })
})
