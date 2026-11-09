import { describe, expect, it } from "vitest"

import { PRODUCT_TYPE } from "@/enums/product-type.enum"

import { parseStoreFilter, STORE_FILTER_OPTIONS } from "./store-filter"

describe("store filter", () => {
  it("lista Todos e um filtro por tipo", () => {
    expect(STORE_FILTER_OPTIONS.map((option) => [option.label, option.href])).toEqual([
      ["Todos", "/loja"],
      ["Camisas", "/loja?tipo=camisas"],
      ["Medalhas", "/loja?tipo=medalhas"],
    ])
  })

  it("lê o tipo da query", () => {
    expect(parseStoreFilter("medalhas")).toBe(PRODUCT_TYPE.MEDAL)
    expect(parseStoreFilter(["camisas", "medalhas"])).toBe(PRODUCT_TYPE.SHIRT)
  })

  it("ausente ou desconhecido = todos", () => {
    expect(parseStoreFilter(undefined)).toBeNull()
    expect(parseStoreFilter("viseiras")).toBeNull()
  })
})
