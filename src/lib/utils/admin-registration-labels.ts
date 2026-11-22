/** Códigos de motivo gravados pelo backend (histórico da inscrição e `estorno_motivo`). */
const REASON_LABELS: Partial<Record<string, string>> = {
  inscricao_criada: "Inscrição criada",
  pagamento_aprovado: "Pagamento aprovado",
  reserva_expirada: "Reserva expirada",
  cancelamento_admin: "Cancelada pelo admin",
  pagamento_divergente: "Valor recebido diferente do cobrado",
  pagamento_duplicado: "Pagamento em duplicidade",
  inscricao_nao_confirmavel: "Inscrição não podia mais ser confirmada",
  inscricao_expirada: "Pago depois da reserva expirar",
  pedido_nao_pagavel: "Pedido não podia mais ser pago",
  pedido_expirado: "Pago depois do pedido expirar",
  captura_tardia: "Pago depois do prazo",
  confirmacao_nao_aplicada: "Confirmação não aplicada",
  estorno_gateway: "Estornado no Mercado Pago",
}

const ORIGIN_LABELS: Partial<Record<string, string>> = {
  sistema: "Sistema",
  admin: "Admin",
  gateway: "Mercado Pago",
  atleta: "Atleta",
}

/** Motivo legível; texto livre (ex.: motivo digitado pelo admin) volta como veio. */
export function getReasonLabel(reason: string): string {
  return REASON_LABELS[reason] ?? reason
}

export function getStatusOriginLabel(origin: string): string {
  return ORIGIN_LABELS[origin] ?? origin
}

const METHOD_LABELS: Partial<Record<string, string>> = {
  bank_transfer: "Pix",
  pix: "Pix",
  credit_card: "Cartão de crédito",
  debit_card: "Cartão de débito",
  account_money: "Saldo Mercado Pago",
}

/** `payment_type_id`/`payment_method_id` do Mercado Pago → rótulo. */
export function getPaymentMethodLabel(method: string): string {
  return METHOD_LABELS[method] ?? method
}
