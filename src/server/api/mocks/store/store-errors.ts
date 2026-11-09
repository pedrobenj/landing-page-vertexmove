import { API_ERROR_CODE } from "@/enums/api-error-code.enum"

/** Erros do repositório mock da loja. O `mock-store-api` os converte em `ApiError` (como a API faria). */
export class DuplicateSlugError extends Error {
  constructor() {
    super("Já existe um produto com esse slug")
    this.name = "DuplicateSlugError"
  }
}

export class DuplicateVariantLabelError extends Error {
  constructor() {
    super("Já existe um tamanho com esse nome")
    this.name = "DuplicateVariantLabelError"
  }
}

export class VariantNotOwnedError extends Error {
  constructor() {
    super("Tamanho não pertence a este produto")
    this.name = "VariantNotOwnedError"
  }
}

export class StockChangedError extends Error {
  constructor() {
    super("O estoque mudou enquanto você editava. Recarregue a página e tente de novo.")
    this.name = "StockChangedError"
  }
}

export class ProductNotFoundError extends Error {
  constructor() {
    super("Produto não encontrado")
    this.name = "ProductNotFoundError"
  }
}

/**
 * Nomes dos erros de conflito (409) do `saveProduct`. Compara-se pelo `name` e não com `instanceof`:
 * o repositório mock vive em `globalThis` e sobrevive ao HMR com as classes antigas.
 */
export const STORE_CONFLICT_ERROR_NAMES = [
  "DuplicateSlugError",
  "DuplicateVariantLabelError",
  "StockChangedError",
  "VariantNotOwnedError",
] as const

export type StoreConflictErrorName = (typeof STORE_CONFLICT_ERROR_NAMES)[number]

export function isStoreConflictErrorName(name: string): name is StoreConflictErrorName {
  return (STORE_CONFLICT_ERROR_NAMES as readonly string[]).includes(name)
}

/** Conflito do repositório → `error.codigo` da resposta 409 (literais a confirmar quando a API da loja existir). */
export const STORE_CONFLICT_ERROR_CODES: Record<StoreConflictErrorName, API_ERROR_CODE> = {
  DuplicateSlugError: API_ERROR_CODE.PRODUCT_DUPLICATE_SLUG,
  DuplicateVariantLabelError: API_ERROR_CODE.DUPLICATE_VARIANT_LABEL,
  StockChangedError: API_ERROR_CODE.STOCK_CHANGED,
  VariantNotOwnedError: API_ERROR_CODE.VARIANT_NOT_OWNED,
}
