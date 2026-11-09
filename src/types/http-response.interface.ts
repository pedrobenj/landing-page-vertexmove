export interface HttpResponse<T = unknown> {
  status: number
  data?: T
  /** Mensagem amigável (getApiErrorMessage). */
  error?: string
  /** `error.codigo` da API, para a UI decidir o fluxo. */
  code?: string
  title?: string
  /** Campo do formulário ao qual o erro se refere (422/409 com campo identificável), para `setError`. */
  field?: string
}
