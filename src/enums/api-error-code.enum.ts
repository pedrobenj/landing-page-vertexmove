/** `error.codigo` da API VertexMove (§6 do CLAUDE.md) e códigos gerados pelo próprio BFF. */
export enum API_ERROR_CODE {
  NOT_AUTHENTICATED = "NAO_AUTENTICADO",
  MFA_REQUIRED = "MFA_NECESSARIO",
  ACCESS_DENIED = "ACESSO_NEGADO",
  DUPLICATE_REGISTRATION = "INSCRICAO_DUPLICADA",
  CONFLICTING_IDENTITIES = "IDENTIDADES_CONFLITANTES",
  DOCUMENT_ACCEPTANCE_REQUIRED = "DOCUMENTO_ACEITE_OBRIGATORIO",
  INVALID_DATA = "DADO_INVALIDO",
  // Usados pelo mock (Task 4); confirmar os literais com o backend.
  NOT_FOUND = "NAO_ENCONTRADO",
  // Código do backend (`uq_evento_slug` → `postgres-error.mapper.ts`).
  DUPLICATE_SLUG = "EVENTO_SLUG_EM_USO",
  INVALID_TRANSITION = "TRANSICAO_INVALIDA",
  SOLD_OUT = "DISTANCIA_ESGOTADA",
  // Presumido (o mock não valida duplicidade de tamanho); confirmar com o backend.
  DUPLICATE_SHIRT_SIZE = "CODIGO_DUPLICADO",
  // Loja: o backend ainda não tem a loja (§16); usados pelo mock da Task 20. Confirmar quando a API existir.
  PRODUCT_DUPLICATE_SLUG = "PRODUTO_SLUG_DUPLICADO",
  DUPLICATE_VARIANT_LABEL = "TAMANHO_DUPLICADO",
  VARIANT_NOT_OWNED = "TAMANHO_DE_OUTRO_PRODUTO",
  STOCK_CHANGED = "ESTOQUE_ALTERADO",
  CART_CHANGED = "CARRINHO_ALTERADO",
  EMPTY_CART = "CARRINHO_VAZIO",
  // Pagamento (Checkout Pro): proposto ao backend (§16); usado pelo mock.
  PAYMENT_UNAVAILABLE = "PAGAMENTO_INDISPONIVEL",
  // Códigos reais do backend no checkout.
  RESERVATION_EXPIRED = "RESERVA_EXPIRADA",
  GATEWAY_UNAVAILABLE = "GATEWAY_INDISPONIVEL",
  // Gerados pelo BFF (não vêm da API).
  TIMEOUT = "TIMEOUT",
  UNAVAILABLE = "INDISPONIVEL",
  STORE_UNAVAILABLE = "LOJA_INDISPONIVEL",
  INVALID_CHECKOUT_URL = "LINK_PAGAMENTO_INVALIDO",
  UNKNOWN = "DESCONHECIDO",
}
