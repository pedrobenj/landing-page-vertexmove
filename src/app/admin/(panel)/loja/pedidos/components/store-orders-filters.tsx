"use client"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { isStoreOrderStatusFilter, ORDER_STATUS_FILTER_OPTIONS } from "@/lib/utils/order-status-filter-options"
import { useAdminStoreOrdersFiltersStore } from "@/stores/admin-store-orders-filters-store"

export function StoreOrdersFilters() {
  const status = useAdminStoreOrdersFiltersStore((state) => state.status)
  const setStatus = useAdminStoreOrdersFiltersStore((state) => state.setStatus)

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Label htmlFor="store-orders-status-filter">Status</Label>
      <Select value={status} onValueChange={(value) => isStoreOrderStatusFilter(value) && setStatus(value)}>
        <SelectTrigger id="store-orders-status-filter" className="w-full sm:w-56">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ORDER_STATUS_FILTER_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
