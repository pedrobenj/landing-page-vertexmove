import { PAYMENT_ISSUE } from "@/enums/payment-issue.enum"

import { getPaymentIssueLabel } from "./status-labels"

/** Situação padrão da fila: inclui os cancelamentos do admin e as divergências (o mais comum de resolver). */
export const DEFAULT_PAYMENT_ISSUE = PAYMENT_ISSUE.REFUND_PENDING

/** Opções do filtro de situação da fila de pagamentos (a API exige uma; não há "todas"). */
export const PAYMENT_ISSUE_FILTER_OPTIONS: readonly { value: PAYMENT_ISSUE; label: string }[] = [
  PAYMENT_ISSUE.REFUND_PENDING,
  PAYMENT_ISSUE.UNDER_REVIEW,
  PAYMENT_ISSUE.MISMATCH,
].map((issue) => ({ value: issue, label: getPaymentIssueLabel(issue) }))

export function isPaymentIssueFilter(value: string): value is PAYMENT_ISSUE {
  return PAYMENT_ISSUE_FILTER_OPTIONS.some((option) => option.value === value)
}
