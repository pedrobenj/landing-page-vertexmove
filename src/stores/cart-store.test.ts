// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"

import { CART_ISSUE_REASON } from "@/enums/cart-issue-reason.enum"

import { selectCartCount, useCartStore } from "./cart-store"

const store = () => useCartStore.getState()

describe("cart store", () => {
  beforeEach(() => {
    localStorage.clear()
    store().clear()
  })

  it("soma quantidades da mesma variante e limita a 10", () => {
    store().addItem("a", 6)
    store().addItem("a", 6)
    expect(store().items).toEqual([{ variantId: "a", quantity: 10 }])
  })

  it("não aceita mais de 20 itens diferentes", () => {
    for (let i = 0; i < 20; i++) store().addItem(`v${i}`, 1)
    expect(store().addItem("v20", 1)).toBe(false)
    expect(store().items).toHaveLength(20)
  })

  it("aplica os avisos do servidor (remove ou reduz)", () => {
    store().addItem("a", 3)
    store().addItem("b", 3)
    store().applyIssues([
      { variantId: "a", reason: CART_ISSUE_REASON.UNAVAILABLE, availableQuantity: 0, message: "" },
      { variantId: "b", reason: CART_ISSUE_REASON.INSUFFICIENT_STOCK, availableQuantity: 1, message: "" },
    ])
    expect(store().items).toEqual([{ variantId: "b", quantity: 1 }])
  })

  it("conta itens e persiste no localStorage", () => {
    store().addItem("a", 2)
    store().addItem("b", 1)
    expect(selectCartCount(store())).toBe(3)
    expect(localStorage.getItem("vertex-cart")).toContain('"variantId":"a"')
  })
})
