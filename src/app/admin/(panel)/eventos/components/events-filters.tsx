"use client"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EVENT_STATUS_FILTER_OPTIONS, isEventStatusFilter } from "@/lib/utils/event-status-filter-options"
import { useAdminEventsFiltersStore } from "@/stores/admin-events-filters-store"

export function EventsFilters() {
  const status = useAdminEventsFiltersStore((state) => state.status)
  const setStatus = useAdminEventsFiltersStore((state) => state.setStatus)

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Label htmlFor="events-status-filter">Status</Label>
      <Select value={status} onValueChange={(value) => isEventStatusFilter(value) && setStatus(value)}>
        <SelectTrigger id="events-status-filter" className="w-full sm:w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {EVENT_STATUS_FILTER_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
