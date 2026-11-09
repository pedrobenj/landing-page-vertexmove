import { beforeEach, describe, expect, it, vi } from "vitest"

import { PRODUCT_TYPE } from "@/enums/product-type.enum"
import type { ProductFormInput } from "@/lib/validations/product.schema"
import { ApiError } from "@/server/api/api-error"
import { buildProduct } from "@/test/factories"

const mocks = vi.hoisted(() => ({
  saveAdminProduct: vi.fn(),
  revalidatePath: vi.fn(),
  requireAdminSession: vi.fn(),
}))

vi.mock("next/navigation", () => ({ unstable_rethrow: () => {} }))
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }))
vi.mock("@/server/api/require-admin-session", () => ({ requireAdminSession: mocks.requireAdminSession }))
vi.mock("@/server/api/endpoints/store", () => ({ saveAdminProduct: mocks.saveAdminProduct }))

const { saveProductAction } = await import("./admin-products")

const input: ProductFormInput = {
  name: "Camisa Teste",
  slug: "camisa-teste",
  description: "Descrição longa o bastante.",
  type: PRODUCT_TYPE.SHIRT,
  price: "89,90",
  pickupInfo: "Sede do Vertex",
  isActive: true,
  isFeatured: false,
  variants: [{ label: "P", stock: "5" }],
}

describe("saveProductAction", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("exige sessão do admin antes de validar", async () => {
    mocks.requireAdminSession.mockRejectedValueOnce(new Error("REDIRECT:/admin/login"))
    await expect(saveProductAction(input)).rejects.toThrow("REDIRECT:/admin/login")
    expect(mocks.saveAdminProduct).not.toHaveBeenCalled()
  })

  it("entrada inválida → 422 DADO_INVALIDO no campo", async () => {
    const response = await saveProductAction({ ...input, slug: "Slug Inválido" })
    expect(response).toMatchObject({ status: 422, code: "DADO_INVALIDO", field: "slug" })
    expect(mocks.saveAdminProduct).not.toHaveBeenCalled()
  })

  it("id inválido → 422 Produto inválido", async () => {
    const response = await saveProductAction(input, "")
    expect(response).toMatchObject({ status: 422, title: "Produto inválido" })
    expect(mocks.saveAdminProduct).not.toHaveBeenCalled()
  })

  it("cria → 201 e revalida a loja e o admin", async () => {
    mocks.saveAdminProduct.mockResolvedValue(buildProduct({ id: "p9", slug: "camisa-teste" }))
    const response = await saveProductAction(input)
    expect(response).toMatchObject({ status: 201, data: { id: "p9" }, title: "Produto cadastrado" })
    expect(mocks.saveAdminProduct).toHaveBeenCalledWith(expect.objectContaining({ price: 8990 }), undefined)
    expect(mocks.revalidatePath.mock.calls).toEqual([["/loja", "layout"], ["/admin/loja/produtos"]])
  })

  it("slug duplicado (409) → erro no campo slug", async () => {
    mocks.saveAdminProduct.mockRejectedValue(new ApiError(409, "PRODUTO_SLUG_DUPLICADO", "Já existe"))
    const response = await saveProductAction(input)
    expect(response).toEqual({
      status: 409,
      code: "PRODUTO_SLUG_DUPLICADO",
      error: "Já existe um produto com este endereço (slug).",
      title: "Não foi possível salvar o produto",
      field: "slug",
    })
  })

  it("estoque alterado (409) → mensagem do código", async () => {
    mocks.saveAdminProduct.mockRejectedValue(new ApiError(409, "ESTOQUE_ALTERADO", "mudou"))
    const response = await saveProductAction(input, "p1")
    expect(response).toMatchObject({ status: 409, code: "ESTOQUE_ALTERADO", error: expect.stringContaining("estoque mudou") })
  })

  it("papel sem permissão (403) → ACESSO_NEGADO", async () => {
    mocks.saveAdminProduct.mockRejectedValue(new ApiError(403, "ACESSO_NEGADO", "sem permissão"))
    const response = await saveProductAction(input)
    expect(response).toMatchObject({ status: 403, code: "ACESSO_NEGADO" })
  })

  it("loja sem backend (503) → LOJA_INDISPONIVEL", async () => {
    mocks.saveAdminProduct.mockRejectedValue(new ApiError(503, "LOJA_INDISPONIVEL", "Loja em breve"))
    const response = await saveProductAction(input)
    expect(response).toMatchObject({ status: 503, code: "LOJA_INDISPONIVEL", error: "A loja estará disponível em breve." })
  })

  it("produto inexistente (404) → NAO_ENCONTRADO", async () => {
    mocks.saveAdminProduct.mockRejectedValue(new ApiError(404, "NAO_ENCONTRADO", "Produto não encontrado"))
    const response = await saveProductAction(input, "nao-existe")
    expect(response).toMatchObject({ status: 404, code: "NAO_ENCONTRADO" })
  })

  it("erro inesperado → 500", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    mocks.saveAdminProduct.mockRejectedValue(new Error("boom"))
    const response = await saveProductAction(input)
    expect(response).toMatchObject({ status: 500, code: "DESCONHECIDO" })
  })
})
