import { beforeEach, describe, expect, it, vi } from "vitest"

import { ADMIN_ROLE } from "@/enums/admin-role.enum"
import { CART_ISSUE_REASON } from "@/enums/cart-issue-reason.enum"
import { ORDER_STATUS } from "@/enums/order-status.enum"
import { PRODUCT_TYPE } from "@/enums/product-type.enum"
import type { ProductFormData } from "@/lib/validations/product.schema"
import type { AdminLoginResponse } from "@/types/api/admin-auth.interface"

// Roda contra o mock HTTP (`USE_MOCK_API`), que fala o mesmo contrato do backend.
const mockEnv = vi.hoisted(() => ({
  NODE_ENV: "test",
  API_URL: "http://api.test",
  API_TIMEOUT_MS: 5_000,
  USE_MOCK_API: true,
  STORE_ENABLED: true,
}))
const session = vi.hoisted(() => ({ requireAdminSession: vi.fn(), token: "" }))

vi.mock("@/lib/env", () => ({ env: mockEnv }))
vi.mock("next/headers", () => ({ headers: async () => new Headers() }))
vi.mock("../require-admin-session", () => ({ requireAdminSession: session.requireAdminSession }))
vi.mock("../admin-fetch", async () => {
  const { apiFetch } = await import("../api-client")
  return {
    adminFetch: (path: string, options: Parameters<typeof apiFetch>[1] = {}) =>
      apiFetch(path, { ...options, headers: { ...options.headers, Authorization: `Bearer ${session.token}` } }),
  }
})

const store = await import("./store")
const { apiFetch } = await import("../api-client")
const { resetMockDb } = await import("../mocks/mock-db")
const { resetMockStore } = await import("../mocks/store/mock-store-state")

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
  type: PRODUCT_TYPE.VISOR,
  price: 4990,
  pickupInfo: "Sede",
  isActive: true,
  isFeatured: false,
  variants: [{ label: "U", stock: 3 }],
  ...overrides,
})

const checkout = (variantId: string, quantity: number) => ({
  name: "Maria Silva",
  cpf: "52998224725",
  whatsapp: "85988887777",
  email: "m@x.com",
  acceptPrivacy: true as const,
  items: [{ variantId, quantity }],
})

describe("endpoints da loja", () => {
  beforeEach(async () => {
    mockEnv.STORE_ENABLED = true
    resetMockDb()
    resetMockStore()
    session.requireAdminSession.mockReset()
    session.requireAdminSession.mockResolvedValue({ id: 1, papel: ADMIN_ROLE.ADMIN })
    const login = await apiFetch<AdminLoginResponse>("/admin/auth/login", {
      method: "POST",
      body: { email: "admin@example.com", senha: "Vertex@Dev12345" },
    })
    session.token = login.accessToken
  })

  it("com STORE_ENABLED=false, toda chamada responde 503 LOJA_INDISPONIVEL", async () => {
    mockEnv.STORE_ENABLED = false
    expect(store.isStoreEnabled()).toBe(false)
    for (const call of [store.listStoreProducts(), store.getStoreOrder("VTX-P-AAAAA-AAAAA"), store.listAdminProducts()]) {
      expect(await catchError(call)).toMatchObject({ name: "ApiError", status: 503, codigo: "LOJA_INDISPONIVEL" })
    }
  })

  it("lista os produtos ativos já no tipo da UI", async () => {
    const products = await store.listStoreProducts()
    expect(products.length).toBeGreaterThan(0)
    expect(products.every((product) => product.isActive)).toBe(true)
    expect(products[0]).toMatchObject({ name: expect.any(String), price: expect.any(Number), type: PRODUCT_TYPE.SHIRT })
  })

  it("produto inexistente → 404 RECURSO_NAO_ENCONTRADO", async () => {
    expect(await catchError(store.getStoreProduct("nao-existe"))).toMatchObject({ status: 404, codigo: "RECURSO_NAO_ENCONTRADO" })
  })

  it("precifica e marca como indisponível id fora do formato sem mandá-lo à API", async () => {
    const cart = await store.priceCart([
      { variantId: "101", quantity: 1 },
      { variantId: "mock-var-1-p", quantity: 1 },
    ])
    expect(cart.lines.map((line) => line.variantId)).toEqual(["101"])
    expect(cart.issues).toEqual([
      expect.objectContaining({ variantId: "mock-var-1-p", reason: CART_ISSUE_REASON.UNAVAILABLE, availableQuantity: 0 }),
    ])
  })

  it("cria o pedido (token só para o servidor) e devolve o resumo sem dados sensíveis", async () => {
    const result = await store.createStoreOrder(checkout("101", 1))
    if (!result.ok) throw new Error("pedido deveria ter sido criado")
    expect(result).toMatchObject({ accessToken: expect.any(String), expiresAt: expect.any(String) })
    const order = await store.getStoreOrder(result.code)
    expect(order).toMatchObject({ buyerFirstName: "Maria", amount: 8990, status: ORDER_STATUS.PENDING })
    expect(JSON.stringify(order)).not.toContain("52998224725")
  })

  it("409 CARRINHO_ALTERADO vira { ok: false, cart } com os avisos", async () => {
    const result = await store.createStoreOrder(checkout("103", 1))
    expect(result).toMatchObject({
      ok: false,
      cart: { issues: [{ variantId: "103", reason: CART_ISSUE_REASON.INSUFFICIENT_STOCK, availableQuantity: 0 }] },
    })
  })

  it("admin exige sessão antes de ler", async () => {
    session.requireAdminSession.mockRejectedValueOnce(new Error("REDIRECT:/admin/login"))
    await expect(store.listAdminProducts()).rejects.toThrow("REDIRECT:/admin/login")
  })

  it("papel sem permissão não salva produto (403 ACESSO_NEGADO)", async () => {
    session.requireAdminSession.mockResolvedValue({ id: 2, papel: "visitante" })
    expect(await catchError(store.saveAdminProduct(newProduct()))).toMatchObject({ status: 403, codigo: "ACESSO_NEGADO" })
  })

  it("cria, edita e recebe os conflitos da API", async () => {
    const created = await store.saveAdminProduct(newProduct())
    expect(await store.getAdminProduct(created.id)).toMatchObject({ name: "Viseira Vertex", isActive: true })
    const edited = await store.saveAdminProduct(
      newProduct({ name: "Viseira Nova", variants: [{ id: created.variants[0].id, label: "U", stock: 5, originalStock: 3 }] }),
      created.id,
    )
    expect(edited).toMatchObject({ name: "Viseira Nova", variants: [{ label: "U", stock: 5 }] })
    expect(await catchError(store.saveAdminProduct(newProduct()))).toMatchObject({ status: 409, codigo: "PRODUTO_SLUG_EM_USO" })
    expect(await catchError(store.saveAdminProduct(newProduct({ slug: "x" }), "999"))).toMatchObject({
      status: 404,
      codigo: "RECURSO_NAO_ENCONTRADO",
    })
  })
})
