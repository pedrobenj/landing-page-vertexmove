/**
 * Erro lançado no client quando uma action da loja responde `LOJA_INDISPONIVEL` (loja ainda sem
 * backend), para a tela mostrar "em breve" em vez do erro genérico — e não tentar de novo.
 */
export class StoreUnavailableError extends Error {
  override readonly name = "StoreUnavailableError"
  constructor() {
    super("Loja em breve")
  }
}

export function isStoreUnavailableError(error: unknown): error is StoreUnavailableError {
  return error instanceof Error && error.name === "StoreUnavailableError"
}
