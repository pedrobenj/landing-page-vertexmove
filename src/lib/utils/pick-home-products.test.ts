import { describe, expect, it } from "vitest"

import { buildProduct } from "@/test/factories"

import { pickHomeProducts } from "./pick-home-products"

const SOLD_OUT = [{ id: "v", label: "U", stock: 0 }]

describe("pickHomeProducts", () => {
  it("põe os destaques primeiro e mantém a ordem da API no resto", () => {
    const products = [
      buildProduct({ id: "a" }),
      buildProduct({ id: "b", isFeatured: true }),
      buildProduct({ id: "c" }),
      buildProduct({ id: "d", isFeatured: true }),
    ]

    expect(pickHomeProducts(products).map((product) => product.id)).toEqual(["b", "d", "a", "c"])
  })

  it("deixa os esgotados para o fim do seu grupo", () => {
    const products = [
      buildProduct({ id: "a", isFeatured: true, variants: SOLD_OUT }),
      buildProduct({ id: "b", isFeatured: true }),
      buildProduct({ id: "c", variants: SOLD_OUT }),
      buildProduct({ id: "d" }),
    ]

    expect(pickHomeProducts(products).map((product) => product.id)).toEqual(["b", "a", "d", "c"])
  })

  it("limita a quantidade", () => {
    const products = Array.from({ length: 6 }, (_, index) => buildProduct({ id: String(index) }))

    expect(pickHomeProducts(products)).toHaveLength(4)
    expect(pickHomeProducts(products, 2).map((product) => product.id)).toEqual(["0", "1"])
  })
})
