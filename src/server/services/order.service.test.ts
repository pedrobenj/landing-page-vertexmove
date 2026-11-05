import { describe, expect, it } from "vitest"

import { createMockStoreRepository } from "@/server/repositories/mock-store.repository"
import { buildProduct } from "@/test/factories"

import { createOrder } from "./order.service"

const checkout = (variantId: string, quantity: number) => ({
  name: "Maria Silva",
  cpf: "52998224725",
  whatsapp: "85988887777",
  email: "m@x.com",
  acceptPrivacy: true as const,
  items: [{ variantId, quantity }],
})

const NOW = new Date("2026-11-04T12:00:00Z")

describe("createOrder", () => {
  it("cria o pedido com preço do servidor e reserva de 30 min", async () => {
    const repo = createMockStoreRepository([buildProduct()])
    const result = await createOrder(checkout("p1-p", 2), repo, NOW)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const summary = await repo.getOrderSummaryByCode(result.code)
    expect(summary?.amount).toBe(17980)
    expect(summary?.expiresAt?.toISOString()).toBe("2026-11-04T12:30:00.000Z")
  })

  it("recusa sem cobrar quando o carrinho mudou", async () => {
    const repo = createMockStoreRepository([buildProduct()])
    const result = await createOrder(checkout("p1-p", 9), repo, NOW)
    expect(result).toMatchObject({ ok: false, reason: "CART_CHANGED" })
    const [product] = await repo.getProductsByVariantIds(["p1-p"])
    expect(product?.variants[0]?.stock).toBe(5) // estoque intacto
  })

  it("recusa quando o estoque acaba entre a validação e a baixa", async () => {
    const repo = createMockStoreRepository([buildProduct({ variants: [{ id: "p1-p", label: "P", stock: 1 }] })])
    const [first, second] = await Promise.all([createOrder(checkout("p1-p", 1), repo, NOW), createOrder(checkout("p1-p", 1), repo, NOW)])
    expect([first.ok, second.ok].filter(Boolean)).toHaveLength(1)
  })
})
