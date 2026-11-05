export class DuplicateSlugError extends Error {
  constructor() {
    super("Já existe um produto com esse slug")
    this.name = "DuplicateSlugError"
  }
}
