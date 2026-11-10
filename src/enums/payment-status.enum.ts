/** Status do último pagamento da inscrição (Checkout Pro). Literais propostos ao backend (§16 do CLAUDE.md). */
export enum PAYMENT_STATUS {
  PENDING = "pendente",
  APPROVED = "aprovado",
  REJECTED = "recusado",
  CANCELLED = "cancelado",
}
