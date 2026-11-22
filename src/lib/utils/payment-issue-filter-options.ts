import { PAYMENT_ISSUE } from "@/enums/payment-issue.enum"

import { getPaymentIssueLabel } from "./status-labels"

export type AdminPaymentIssueFilter = PAYMENT_ISSUE | "todas"

/** Opções do filtro de situação da fila de pagamentos do admin. */
export const PAYMENT_ISSUE_FILTER_OPTIONS: readonly { value: AdminPaymentIssueFilter; label: string }[] = [
  { value: "todas", label: "Todas as pendências" },
  ...Object.values(PAYMENT_ISSUE).map((issue) => ({ value: issue, label: getPaymentIssueLabel(issue) })),
]

export function isPaymentIssueFilter(value: string): value is AdminPaymentIssueFilter {
  return PAYMENT_ISSUE_FILTER_OPTIONS.some((option) => option.value === value)
}
