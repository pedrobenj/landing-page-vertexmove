export interface ApiFieldError {
  field: string
  message: string
}

const FIELD_MESSAGE = /^([A-Za-z][\w.]*):\s+(.+)$/

/**
 * Extrai o campo de uma `mensagem` de 422 no formato `"campo: mensagem"` (o do mock; confirmar com o backend).
 * Devolve `null` se a mensagem não identificar um campo.
 */
export function parseApiFieldError(mensagem: string): ApiFieldError | null {
  const match = FIELD_MESSAGE.exec(mensagem.trim())
  return match ? { field: match[1], message: match[2] } : null
}
