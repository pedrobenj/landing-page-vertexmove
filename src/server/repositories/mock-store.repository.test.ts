import { describe, expect, it } from "vitest"

import type { ProductFormData } from "@/lib/validations/product.schema"
import { DuplicateSlugError } from "@/server/errors"
import { buildProduct } from "@/test/factories"

import { createMockStoreRepository } from "./mock-store.repository"

const order = (variantId: string, quantity: number) => ({
  buyer: { name: "Maria Silva", cpf: "52998224725", whatsapp: "85988887777", email: "m@x.com" },
  amount: 8990 * quantity,
  expiresAt: new Date("2026-11-04T12:30:00Z"),
  privacyAcceptedAt: new Date("2026-11-04T12:00:00Z"),
  lines: [{ variantId, quantity, unitPrice: 8990, productName: "Camisa Teste", variantLabel: "P" }],
})

const productData = (overrides: Partial<ProductFormData> = {}): ProductFormData => ({
  name: "Outra",
  slug: "camisa-teste",
  description: "Descrição longa o bastante.",
  type: "SHIRT",
  price: 1000,
  pickupInfo: "Sede",
  isActive: true,
  isFeatured: false,
  variants: [{ label: "U", stock: 1 }],
  ...overrides,
})

describe("mock store repository", () => {
  it("lista só produtos ativos", async () => {
    const repo = createMockStoreRepository([buildProduct(), buildProduct({ id: "p2", slug: "x", isActive: false, variants: [] })])
    expect((await repo.listActiveProducts()).map((p) => p.id)).toEqual(["p1"])
  })

  it("baixa o estoque e cria o pedido", async () => {
    const repo = createMockStoreRepository([buildProduct()])
    const result = await repo.createPendingOrder(order("p1-p", 2))
    expect(result.ok).toBe(true)
    const [product] = await repo.getProductsByVariantIds(["p1-p"])
    expect(product?.variants.find((v) => v.id === "p1-p")?.stock).toBe(3)
  })

  it("duas compras da última unidade: só uma passa", async () => {
    const repo = createMockStoreRepository([buildProduct({ variants: [{ id: "p1-p", label: "P", stock: 1 }] })])
    const results = await Promise.all([repo.createPendingOrder(order("p1-p", 1)), repo.createPendingOrder(order("p1-p", 1))])
    expect(results.filter((r) => r.ok)).toHaveLength(1)
    expect(results.find((r) => !r.ok)).toEqual({ ok: false, outOfStockVariantIds: ["p1-p"] })
  })

  it("resume o pedido sem dados sensíveis", async () => {
    const repo = createMockStoreRepository([buildProduct()])
    const result = await repo.createPendingOrder(order("p1-p", 1))
    if (!result.ok) throw new Error("pedido deveria ter sido criado")
    const summary = await repo.getOrderSummaryByCode(result.code)
    expect(summary).toMatchObject({ status: "PENDING", amount: 8990, buyerFirstName: "Maria", pickupInfos: ["Retirada na sede"] })
    expect(JSON.stringify(summary)).not.toContain("52998224725")
  })

  it("impede slug duplicado ao salvar", async () => {
    const repo = createMockStoreRepository([buildProduct()])
    await expect(repo.saveProduct(productData())).rejects.toBeInstanceOf(DuplicateSlugError)
  })

  it("recusa tamanho de outro produto ao editar, sem alterar nada", async () => {
    const repo = createMockStoreRepository([
      buildProduct(),
      buildProduct({ id: "p2", slug: "outra", variants: [{ id: "p2-g", label: "G", stock: 7 }] }),
    ])
    const data = productData({ slug: "camisa-teste", name: "Renomeada", variants: [{ id: "p2-g", label: "G", stock: 99 }] })

    await expect(repo.saveProduct(data, "p1")).rejects.toThrow("Tamanho não pertence a este produto")

    expect((await repo.getProductById("p1"))?.name).toBe("Camisa Teste")
    expect((await repo.getProductById("p2"))?.variants).toEqual([{ id: "p2-g", label: "G", stock: 7 }])
  })

  it("edita tamanhos existentes mantendo o id e cria os novos", async () => {
    const repo = createMockStoreRepository([buildProduct()])
    const saved = await repo.saveProduct(
      productData({
        variants: [
          { id: "p1-p", label: "M", stock: 2 },
          { id: "p1-m", label: "P", stock: 4 },
          { label: "G", stock: 1 },
        ],
      }),
      "p1",
    )
    expect(saved.variants.slice(0, 2)).toEqual([
      { id: "p1-p", label: "M", stock: 2 },
      { id: "p1-m", label: "P", stock: 4 },
    ])
    expect(saved.variants[2]).toMatchObject({ label: "G", stock: 1 })
  })
})
