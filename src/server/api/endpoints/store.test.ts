import { beforeEach, describe, expect, it, vi } from "vitest"

import { ADMIN_ROLE } from "@/enums/admin-role.enum"
import { PRODUCT_TYPE } from "@/enums/product-type.enum"
import type { ProductFormData } from "@/lib/validations/product.schema"

const mockEnv = vi.hoisted(() => ({ NODE_ENV: "test", API_URL: "http://api.test", API_TIMEOUT_MS: 5_000, USE_MOCK_API: true }))
const session = vi.hoisted(() => ({ requireAdminSession: vi.fn() }))

vi.mock("@/lib/env", () => ({ env: mockEnv }))
vi.mock("../require-admin-session", () => session)

const store = await import("./store")
const { resetMockStore } = await import("../mocks/store/mock-store-api")

async function catchError(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise
  } catch (error) {
    return error
  }
  throw new Error("esperava que a promise rejeitasse")
}

const newProduct = (overrides: Partial<ProductFormData> = {}): ProductFormData => ({
  name: "Viseira Vertex",
  slug: "viseira-vertex",
  description: "Viseira leve para treinos.",
  type: PRODUCT_TYPE.SHIRT,
  price: 4990,
  pickupInfo: "Sede",
  isActive: true,
  isFeatured: false,
  variants: [{ label: "U", stock: 3 }],
  ...overrides,
})

describe("endpoints da loja", () => {
  beforeEach(() => {
    mockEnv.USE_MOCK_API = true
    resetMockStore()
    session.requireAdminSession.mockReset()
    session.requireAdminSession.mockResolvedValue({ id: 1, papel: ADMIN_ROLE.ORGANIZATION })
  })

  it("sem o mock, toda chamada responde 503 LOJA_INDISPONIVEL", async () => {
    mockEnv.USE_MOCK_API = false
    for (const call of [store.listStoreProducts(), store.getStoreOrder("VTX-P-AAAA"), store.listAdminProducts()]) {
      expect(await catchError(call)).toMatchObject({ name: "ApiError", status: 503, codigo: "LOJA_INDISPONIVEL" })
    }
  })

  it("lista só os produtos ativos do seed", async () => {
    const products = await store.listStoreProducts()
    expect(products.length).toBeGreaterThan(0)
    expect(products.every((product) => product.isActive)).toBe(true)
  })

  it("produto inexistente → 404 NAO_ENCONTRADO", async () => {
    expect(await catchError(store.getStoreProduct("nao-existe"))).toMatchObject({ status: 404, codigo: "NAO_ENCONTRADO" })
  })

  it("cria o pedido e devolve o resumo sem dados sensíveis", async () => {
    const result = await store.createStoreOrder({
      name: "Maria Silva",
      cpf: "52998224725",
      whatsapp: "85988887777",
      email: "m@x.com",
      acceptPrivacy: true,
      items: [{ variantId: "mock-var-1-p", quantity: 1 }],
    })
    if (!result.ok) throw new Error("pedido deveria ter sido criado")
    const order = await store.getStoreOrder(result.code)
    expect(order).toMatchObject({ buyerFirstName: "Maria", amount: 8990 })
    expect(JSON.stringify(order)).not.toContain("52998224725")
  })

  it("admin exige sessão antes de ler", async () => {
    session.requireAdminSession.mockRejectedValueOnce(new Error("REDIRECT:/admin/login"))
    await expect(store.listAdminProducts()).rejects.toThrow("REDIRECT:/admin/login")
  })

  it("operador não salva produto (403 ACESSO_NEGADO)", async () => {
    session.requireAdminSession.mockResolvedValue({ id: 2, papel: ADMIN_ROLE.OPERATOR })
    expect(await catchError(store.saveAdminProduct(newProduct()))).toMatchObject({ status: 403, codigo: "ACESSO_NEGADO" })
  })

  it("salva e converte conflitos do repositório em 409 com código", async () => {
    const created = await store.saveAdminProduct(newProduct())
    expect((await store.getAdminProduct(created.id)).name).toBe("Viseira Vertex")
    expect(await catchError(store.saveAdminProduct(newProduct()))).toMatchObject({ status: 409, codigo: "PRODUTO_SLUG_DUPLICADO" })
    expect(await catchError(store.saveAdminProduct(newProduct({ slug: "x" }), "nao-existe"))).toMatchObject({
      status: 404,
      codigo: "NAO_ENCONTRADO",
    })
  })
})
