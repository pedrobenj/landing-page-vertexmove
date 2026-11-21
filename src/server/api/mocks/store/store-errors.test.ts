import { describe, expect, it } from "vitest"

import {
  DuplicateSlugError,
  isStoreConflictErrorName,
  ProductNotFoundError,
  STORE_CONFLICT_ERRORS,
  STORE_CONFLICT_ERROR_NAMES,
  StockChangedError,
  VariantNotOwnedError,
} from "./store-errors"

// As rotas do mock mapeiam os erros pelo `name`: ele precisa bater com a lista exportada.
describe("store errors", () => {
  it("cada erro de conflito tem o name listado em STORE_CONFLICT_ERROR_NAMES", () => {
    const names = [new DuplicateSlugError(), new StockChangedError(), new VariantNotOwnedError()].map(
      (error) => error.name,
    )
    expect(names).toEqual([...STORE_CONFLICT_ERROR_NAMES])
    expect(names.every(isStoreConflictErrorName)).toBe(true)
  })

  it("ProductNotFoundError tem name próprio e não é conflito", () => {
    const error = new ProductNotFoundError()
    expect(error.name).toBe("ProductNotFoundError")
    expect(isStoreConflictErrorName(error.name)).toBe(false)
  })

  it("usa os status e códigos do backend", () => {
    expect(STORE_CONFLICT_ERRORS).toEqual({
      DuplicateSlugError: { status: 409, codigo: "PRODUTO_SLUG_EM_USO" },
      StockChangedError: { status: 409, codigo: "ESTOQUE_ALTERADO" },
      VariantNotOwnedError: { status: 422, codigo: "VARIANTE_DE_OUTRO_PRODUTO" },
    })
  })
})
