export interface HttpResponse<T = unknown> {
  status: number
  data?: T
  /** Mensagem amigável (getApiErrorMessage). */
  error?: string
  /** `error.codigo` da API, para a UI decidir o fluxo. */
  code?: string
  title?: string
}
