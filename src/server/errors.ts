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
