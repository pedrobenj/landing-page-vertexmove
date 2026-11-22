"use client"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { isPaymentIssueFilter, PAYMENT_ISSUE_FILTER_OPTIONS } from "@/lib/utils/payment-issue-filter-options"
import { useAdminPaymentsFiltersStore } from "@/stores/admin-payments-filters-store"

export function PaymentsFilters() {
  const situacao = useAdminPaymentsFiltersStore((state) => state.situacao)
  const setSituacao = useAdminPaymentsFiltersStore((state) => state.setSituacao)

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Label htmlFor="payments-issue-filter">Situação</Label>
      <Select value={situacao} onValueChange={(value) => isPaymentIssueFilter(value) && setSituacao(value)}>
        <SelectTrigger id="payments-issue-filter" className="w-full sm:w-56">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PAYMENT_ISSUE_FILTER_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
