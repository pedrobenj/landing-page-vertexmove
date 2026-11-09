import { describe, expect, it } from "vitest"

import {
  DuplicateSlugError,
  DuplicateVariantLabelError,
  ProductNotFoundError,
  STORE_CONFLICT_ERROR_CODES,
  STORE_CONFLICT_ERROR_NAMES,
  StockChangedError,
  VariantNotOwnedError,
  isStoreConflictErrorName,
} from "./store-errors"

// As actions mapeiam os erros pelo `name`: ele precisa bater com a lista exportada.
describe("store errors", () => {
  it("cada erro de conflito tem o name listado em STORE_CONFLICT_ERROR_NAMES", () => {
    const names = [new DuplicateSlugError(), new DuplicateVariantLabelError(), new StockChangedError(), new VariantNotOwnedError()].map(
      (error) => error.name,
    )
    expect(names).toEqual([...STORE_CONFLICT_ERROR_NAMES])
    expect(names.every(isStoreConflictErrorName)).toBe(true)
  })

  it("ProductNotFoundError tem name próprio e não é conflito", () => {
    const error = new ProductNotFoundError()
    expect(error.name).toBe("ProductNotFoundError")
    expect(error.message).toBe("Produto não encontrado")
    expect(isStoreConflictErrorName(error.name)).toBe(false)
  })

  it("cada conflito tem um código de API próprio", () => {
    const codes = STORE_CONFLICT_ERROR_NAMES.map((name) => STORE_CONFLICT_ERROR_CODES[name])
    expect(new Set(codes).size).toBe(STORE_CONFLICT_ERROR_NAMES.length)
    expect(STORE_CONFLICT_ERROR_CODES.DuplicateSlugError).toBe("PRODUTO_SLUG_DUPLICADO")
  })
})
