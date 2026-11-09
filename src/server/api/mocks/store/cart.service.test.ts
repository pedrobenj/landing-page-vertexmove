import { describe, expect, it } from "vitest"

import { CART_ISSUE_REASON } from "@/enums/cart-issue-reason.enum"
import { buildProduct } from "@/test/factories"

import { priceCart } from "./cart.service"

describe("priceCart", () => {
  it("usa o preço do servidor e soma o total", () => {
    const cart = priceCart([{ variantId: "p1-p", quantity: 2 }], [buildProduct()])
    expect(cart.issues).toEqual([])
    expect(cart.lines[0]).toMatchObject({ unitPrice: 8990, quantity: 2, lineTotal: 17980, variantLabel: "P" })
    expect(cart.total).toBe(17980)
    expect(cart.itemCount).toBe(2)
  })

  it("remove variante inexistente ou de produto inativo", () => {
    const cart = priceCart(
      [
        { variantId: "nao-existe", quantity: 1 },
        { variantId: "p1-p", quantity: 1 },
      ],
      [buildProduct({ isActive: false })],
    )
    expect(cart.lines).toEqual([])
    expect(cart.issues.map((i) => i.reason)).toEqual([CART_ISSUE_REASON.UNAVAILABLE, CART_ISSUE_REASON.UNAVAILABLE])
    expect(cart.issues.every((i) => i.availableQuantity === 0)).toBe(true)
  })

  it("avisa tamanho esgotado", () => {
    const cart = priceCart([{ variantId: "p1-m", quantity: 1 }], [buildProduct()])
    expect(cart.lines).toEqual([])
    expect(cart.issues[0]).toMatchObject({
      reason: CART_ISSUE_REASON.INSUFFICIENT_STOCK,
      availableQuantity: 0,
      message: "Camisa Teste (M) esgotou",
    })
  })

  it("reduz a quantidade ao estoque disponível", () => {
    const cart = priceCart([{ variantId: "p1-p", quantity: 8 }], [buildProduct()])
    expect(cart.lines[0]?.quantity).toBe(5)
    expect(cart.issues[0]).toMatchObject({
      reason: CART_ISSUE_REASON.INSUFFICIENT_STOCK,
      availableQuantity: 5,
      message: "Só restam 5 unidades de Camisa Teste (P)",
    })
  })
})
