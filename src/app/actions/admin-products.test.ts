import { beforeEach, describe, expect, it, vi } from "vitest"

import type { ProductFormInput } from "@/lib/validations/product.schema"
import { DuplicateSlugError, ProductNotFoundError } from "@/server/errors"
import { buildProduct } from "@/test/factories"

import { saveProductAction } from "./admin-products"

const mocks = vi.hoisted(() => ({
  getAdminSession: vi.fn(),
  saveProduct: vi.fn(),
  revalidatePath: vi.fn(),
}))

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }))
vi.mock("@/server/auth/require-admin", () => ({ getAdminSession: mocks.getAdminSession }))
vi.mock("@/server/repositories/store.repository", () => ({
  getStoreRepository: () => ({ saveProduct: mocks.saveProduct }),
}))

const input: ProductFormInput = {
  name: "Camisa Teste",
  slug: "camisa-teste",
  description: "Descrição longa o bastante.",
  type: "SHIRT",
  price: "89,90",
  pickupInfo: "Sede do Vertex",
  isActive: true,
  isFeatured: false,
  variants: [{ label: "P", stock: "5" }],
}

describe("saveProductAction", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getAdminSession.mockResolvedValue({ user: { id: "admin" } })
  })

  it("sem sessão → 401, sem tocar no repositório", async () => {
    mocks.getAdminSession.mockResolvedValue(null)
    const response = await saveProductAction(input)
    expect(response).toMatchObject({ status: 401, error: "UNAUTHORIZED" })
    expect(mocks.saveProduct).not.toHaveBeenCalled()
  })

  it("entrada inválida → 400", async () => {
    const response = await saveProductAction({ ...input, slug: "Slug Inválido" })
    expect(response).toMatchObject({ status: 400, error: "INVALID_INPUT" })
    expect(mocks.saveProduct).not.toHaveBeenCalled()
  })

  it("id inválido → 400 Produto inválido", async () => {
    const response = await saveProductAction(input, "")
    expect(response).toMatchObject({ status: 400, title: "Produto inválido" })
  })

  it("cria → 201 e revalida loja, produto, admin e home", async () => {
    mocks.saveProduct.mockResolvedValue(buildProduct({ id: "p9", slug: "camisa-teste" }))
    const response = await saveProductAction(input)
    expect(response).toMatchObject({ status: 201, data: { id: "p9" } })
    expect(mocks.saveProduct).toHaveBeenCalledWith(expect.objectContaining({ price: 8990 }), undefined)
    expect(mocks.revalidatePath.mock.calls.map(([path]) => path)).toEqual(["/loja", "/loja/camisa-teste", "/admin/loja/produtos", "/"])
  })

  it("DuplicateSlugError → 409 DUPLICATE_SLUG", async () => {
    mocks.saveProduct.mockRejectedValue(new DuplicateSlugError())
    const response = await saveProductAction(input)
    expect(response).toEqual({ status: 409, error: "DUPLICATE_SLUG", title: "Já existe um produto com esse slug" })
  })

  it("ProductNotFoundError → 404 NOT_FOUND", async () => {
    mocks.saveProduct.mockRejectedValue(new ProductNotFoundError())
    const response = await saveProductAction(input, "nao-existe")
    expect(response).toEqual({ status: 404, error: "NOT_FOUND", title: "Produto não encontrado" })
  })

  it("erro inesperado → 500", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    mocks.saveProduct.mockRejectedValue(new Error("boom"))
    const response = await saveProductAction(input)
    expect(response).toMatchObject({ status: 500, error: "INTERNAL" })
  })
})
