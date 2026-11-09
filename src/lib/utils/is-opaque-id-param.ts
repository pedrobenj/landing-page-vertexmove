/**
 * Id textual opaco de parâmetro de rota (produtos da loja: hoje `mock-prod-1`; o formato do backend
 * ainda não foi definido — cuid/uuid cabem aqui). Rejeita vazio, barras, espaços e valores longos,
 * para responder 404 sem chegar à API.
 */
const OPAQUE_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/

export function isOpaqueIdParam(value: string): boolean {
  return OPAQUE_ID_PATTERN.test(value)
}
