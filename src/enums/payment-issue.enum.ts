/** Filtro `situacao` de `GET /admin/pagamentos` (pagamentos que pedem ação do admin). */
export enum PAYMENT_ISSUE {
  UNDER_REVIEW = "em_analise",
  REFUND_PENDING = "estorno_pendente",
  MISMATCH = "divergente",
}
