"use client"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  isLgpdStatusFilter,
  isLgpdTypeFilter,
  LGPD_STATUS_FILTER_OPTIONS,
  LGPD_TYPE_FILTER_OPTIONS,
} from "@/lib/utils/lgpd-labels"
import { useAdminLgpdFiltersStore } from "@/stores/admin-lgpd-filters-store"

export function LgpdRequestsFilters() {
  const status = useAdminLgpdFiltersStore((state) => state.status)
  const tipo = useAdminLgpdFiltersStore((state) => state.tipo)
  const setStatus = useAdminLgpdFiltersStore((state) => state.setStatus)
  const setTipo = useAdminLgpdFiltersStore((state) => state.setTipo)

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex flex-col gap-2">
        <Label htmlFor="lgpd-status-filter">Status</Label>
        <Select value={status} onValueChange={(value) => isLgpdStatusFilter(value) && setStatus(value)}>
          <SelectTrigger id="lgpd-status-filter" className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LGPD_STATUS_FILTER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="lgpd-type-filter">Tipo</Label>
        <Select value={tipo} onValueChange={(value) => isLgpdTypeFilter(value) && setTipo(value)}>
          <SelectTrigger id="lgpd-type-filter" className="w-full sm:w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LGPD_TYPE_FILTER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
