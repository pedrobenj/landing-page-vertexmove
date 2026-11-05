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

  it("rejeita slug inválido e preço zerado", () => {
    expect(productFormSchema.safeParse({ ...valid, slug: "Camisa Oficial" }).success).toBe(false)
    expect(productFormSchema.safeParse({ ...valid, price: "0" }).success).toBe(false)
  })

  it("marca cada tamanho repetido na própria linha", () => {
    const result = productFormSchema.safeParse({
      ...valid,
      variants: [
        { label: "P", stock: "1" },
        { label: "M", stock: "1" },
        { label: "p", stock: "1" },
      ],
    })
    expect(result.success).toBe(false)
    const issues = result.error?.issues.map(({ path, message }) => ({ path, message }))
    expect(issues).toEqual([
      { path: ["variants", 0, "label"], message: "Tamanho repetido" },
      { path: ["variants", 2, "label"], message: "Tamanho repetido" },
    ])
  })

  it("exige pelo menos um tamanho", () => {
    const result = productFormSchema.safeParse({ ...valid, variants: [] })
    expect(result.error?.issues).toEqual([expect.objectContaining({ path: ["variants"], message: "Adicione pelo menos um tamanho" })])
  })

  it("normaliza o tamanho para maiúsculas", () => {
    const result = productFormSchema.parse({
      ...valid,
      variants: [
        { label: " gg ", stock: "1" },
        { label: "Única", stock: "1" },
      ],
    })
    expect(result.variants.map((variant) => variant.label)).toEqual(["GG", "ÚNICA"])
  })

  it("rejeita tamanho com mais de 10 caracteres", () => {
    const result = productFormSchema.safeParse({
      ...valid,
      variants: [{ label: "Extra grande", stock: "1" }],
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe("Tamanho com no máximo 10 caracteres")
  })

  it("limita estoque a 100.000 unidades", () => {
    expect(productFormSchema.safeParse({ ...valid, variants: [{ label: "P", stock: "100000" }] }).success).toBe(
      true,
    )
    const result = productFormSchema.safeParse({ ...valid, variants: [{ label: "P", stock: "100001" }] })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe("Estoque máximo de 100.000 unidades")
  })

  it("limita preço a R$ 10.000,00", () => {
    expect(productFormSchema.parse({ ...valid, price: "10.000,00" }).price).toBe(1_000_000)
    const result = productFormSchema.safeParse({ ...valid, price: "10.000,01" })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe("Preço máximo de R$ 10.000,00")
  })

  it("converte o estoque original dos tamanhos já salvos", () => {
    const result = productFormSchema.parse({
      ...valid,
      variants: [
        { id: "v1", label: "P", stock: "12", originalStock: "10" },
        { label: "M", stock: "3" },
      ],
    })
    expect(result.variants).toEqual([
      { id: "v1", label: "P", stock: 12, originalStock: 10 },
      { label: "M", stock: 3 },
    ])
    expect(
      productFormSchema.safeParse({ ...valid, variants: [{ id: "v1", label: "P", stock: "1", originalStock: "x" }] })
        .success,
    ).toBe(false)
  })
})
