import { describe, expect, it } from "vitest"

import { cartItemsSchema } from "./cart.schema"

describe("cartItemsSchema", () => {
  it("aceita carrinho válido", () => {
    expect(cartItemsSchema.safeParse([{ variantId: "a", quantity: 2 }]).success).toBe(true)
  })

  it("rejeita vazio, quantidade acima do limite e itens duplicados", () => {
    expect(cartItemsSchema.safeParse([]).success).toBe(false)
    expect(cartItemsSchema.safeParse([{ variantId: "a", quantity: 11 }]).success).toBe(false)
    expect(
      cartItemsSchema.safeParse([
        { variantId: "a", quantity: 1 },
        { variantId: "a", quantity: 1 },
      ]).success,
    ).toBe(false)
  })

  it("rejeita mais de 20 itens", () => {
    const items = Array.from({ length: 21 }, (_, i) => ({ variantId: `v${i}`, quantity: 1 }))
    expect(cartItemsSchema.safeParse(items).success).toBe(false)
  })
})
