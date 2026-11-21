import "server-only"

export class ApiError extends Error {
  override readonly name = "ApiError"
  constructor(
    readonly status: number,
    readonly codigo: string,
    readonly mensagem: string,
    /** Primeiro campo de `detalhes` num 422 do backend (ex.: `endereco`). */
    readonly campo?: string,
    /** `error.dados` do backend (ex.: o carrinho recalculado do `409 CARRINHO_ALTERADO`). */
    readonly dados?: Readonly<Record<string, unknown>>,
  ) {
    super(`${status} ${codigo}: ${mensagem}`)
  }
}

/** instanceof falha entre módulos recarregados pelo HMR — compare pelo name. */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof Error && error.name === "ApiError"
}
