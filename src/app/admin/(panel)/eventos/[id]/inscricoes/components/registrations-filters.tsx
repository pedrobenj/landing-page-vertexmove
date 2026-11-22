"use client"

import { Search } from "lucide-react"
import { useEffect, useState } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { isRegistrationStatusFilter, REGISTRATION_STATUS_FILTER_OPTIONS } from "@/lib/utils/registration-status-filter-options"
import { useAdminRegistrationsFiltersStore } from "@/stores/admin-registrations-filters-store"
import type { Distance } from "@/types/api/distance.interface"

import { FilterSelectOption } from "./filter-select-option"

interface RegistrationsFiltersProps {
  distances: Pick<Distance, "id" | "nome">[]
}

const ALL_DISTANCES = "todas"
const SEARCH_DEBOUNCE_MS = 400

/** Status, distância e busca por nome ou código (com debounce). Tudo no Zustand, nunca na URL. */
export function RegistrationsFilters({ distances }: RegistrationsFiltersProps) {
  const status = useAdminRegistrationsFiltersStore((state) => state.status)
  const distanciaId = useAdminRegistrationsFiltersStore((state) => state.distanciaId)
  const busca = useAdminRegistrationsFiltersStore((state) => state.busca)
  const setStatus = useAdminRegistrationsFiltersStore((state) => state.setStatus)
  const setDistance = useAdminRegistrationsFiltersStore((state) => state.setDistance)
  const setSearch = useAdminRegistrationsFiltersStore((state) => state.setSearch)
  const [term, setTerm] = useState(busca)
  const debounced = useDebouncedValue(term.trim(), SEARCH_DEBOUNCE_MS)

  useEffect(() => {
    if (debounced !== useAdminRegistrationsFiltersStore.getState().busca) setSearch(debounced)
  }, [debounced, setSearch])

  return (
    <div className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-end">
      <div className="flex flex-col gap-2">
        <Label htmlFor="registrations-search">Buscar</Label>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            id="registrations-search"
            type="search"
            placeholder="Nome ou código da inscrição"
            value={term}
            maxLength={100}
            onChange={(event) => setTerm(event.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="registrations-status-filter">Status</Label>
        <Select value={status} onValueChange={(value) => isRegistrationStatusFilter(value) && setStatus(value)}>
          <SelectTrigger id="registrations-status-filter" className="w-full md:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {REGISTRATION_STATUS_FILTER_OPTIONS.map((option) => (
              <FilterSelectOption key={option.value} value={option.value} label={option.label} />
            ))}
          </SelectContent>
        </Select>
      </div>
      {distances.length > 0 && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="registrations-distance-filter">Distância</Label>
          <Select
            value={distanciaId === null ? ALL_DISTANCES : String(distanciaId)}
            onValueChange={(value) => setDistance(value === ALL_DISTANCES ? null : Number(value))}
          >
            <SelectTrigger id="registrations-distance-filter" className="w-full md:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <FilterSelectOption value={ALL_DISTANCES} label="Todas" />
              {distances.map((distance) => (
                <FilterSelectOption key={distance.id} value={String(distance.id)} label={distance.nome} />
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}
