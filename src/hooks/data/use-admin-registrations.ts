"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { listAdminRegistrationsAction } from "@/app/actions/admin-registrations"
import { queryKeys } from "@/lib/utils/query-keys"
import { useAdminRegistrationsFiltersStore } from "@/stores/admin-registrations-filters-store"

/** Página atual da lista de inscritos da corrida (filtros e cursor no Zustand). */
export function useAdminRegistrations(eventId: number) {
  const status = useAdminRegistrationsFiltersStore((state) => state.status)
  const distanciaId = useAdminRegistrationsFiltersStore((state) => state.distanciaId)
  const busca = useAdminRegistrationsFiltersStore((state) => state.busca)
  const cursor = useAdminRegistrationsFiltersStore((state) => state.cursor)
  const filters = { eventId, status, distanciaId, busca, cursor }

  return useQuery({
    queryKey: queryKeys.admin.registrations(filters),
    queryFn: async () => {
      const response = await listAdminRegistrationsAction(filters)
      if (!response.data) throw new Error(response.error ?? "Não foi possível carregar as inscrições")
      return response.data
    },
    // Admin: sempre atual (CLAUDE.md §10).
    staleTime: 0,
    // Mantém a página anterior na tela enquanto a próxima carrega.
    placeholderData: keepPreviousData,
  })
}
