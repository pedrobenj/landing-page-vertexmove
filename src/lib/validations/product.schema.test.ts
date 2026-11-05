import { describe, expect, it } from "vitest"

import { productFormSchema } from "./product.schema"

const valid = {
  name: "Camisa Oficial",
  slug: "camisa-oficial",
  description: "Camisa dry-fit oficial do Vertex.",
  type: "SHIRT",
  price: "89,90",
  pickupInfo: "Retirada na sede, sábados 8h–12h",
  isActive: true,
  isFeatured: false,
  variants: [
    { label: "P", stock: "10" },
    { label: "M", stock: "0" },
  ],
}

describe("productFormSchema", () => {
  it("converte preço e estoque", () => {
    const result = productFormSchema.parse(valid)
    expect(result.price).toBe(8990)
    expect(result.variants).toEqual([
      { label: "P", stock: 10 },
      { label: "M", stock: 0 },
    ])
  })

  it("rejeita slug inválido, preço zerado e tamanhos repetidos", () => {
    expect(productFormSchema.safeParse({ ...valid, slug: "Camisa Oficial" }).success).toBe(false)
    expect(productFormSchema.safeParse({ ...valid, price: "0" }).success).toBe(false)
    expect(
      productFormSchema.safeParse({
        ...valid,
        variants: [
          { label: "P", stock: "1" },
          { label: "p", stock: "1" },
        ],
      }).success,
    ).toBe(false)
  })
})
