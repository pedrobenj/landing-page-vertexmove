import { describe, expect, it } from "vitest"

import { getTotalStock, isProductSoldOut } from "./product-stock"

const variants = (...stocks: number[]) => stocks.map((stock, i) => ({ id: `v${i}`, label: `T${i}`, stock }))

describe("product-stock", () => {
  it("esgotado quando todas as variantes estão zeradas", () => {
    expect(isProductSoldOut({ variants: variants(0, 0) })).toBe(true)
    expect(isProductSoldOut({ variants: variants(0, 3) })).toBe(false)
  })

  it("esgotado quando não há variantes", () => {
    expect(isProductSoldOut({ variants: [] })).toBe(true)
  })

  it("soma o estoque", () => {
    expect(getTotalStock({ variants: variants(2, 5, 0) })).toBe(7)
  })
})
