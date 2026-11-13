/** Estados de `pagamento.status` no backend (matriz em `valida_transicao_pagamento`, migrations 0009/0012). */
export enum PAYMENT_STATUS {
  CREATED = "criado",
  PENDING = "pendente",
  UNDER_REVIEW = "em_analise",
  APPROVED = "aprovado",
  REJECTED = "recusado",
  REFUNDED = "estornado",
  CANCELLED = "cancelado",
  EXPIRED = "expirado",
}
