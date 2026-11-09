"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { listAdminEventsAction } from "@/app/actions/admin-events"
import { queryKeys } from "@/lib/utils/query-keys"
import { useAdminEventsFiltersStore } from "@/stores/admin-events-filters-store"

/** Página atual da lista de corridas do admin (filtro e cursor no Zustand). */
export function useAdminEvents() {
  const status = useAdminEventsFiltersStore((state) => state.status)
  const cursor = useAdminEventsFiltersStore((state) => state.cursor)

  return useQuery({
    queryKey: queryKeys.admin.events({ status, cursor }),
    queryFn: async () => {
      const response = await listAdminEventsAction({ status, cursor })
      if (!response.data) throw new Error(response.error ?? "Não foi possível carregar as corridas")
      return response.data
    },
    // Admin: sempre atual (CLAUDE.md §10).
    staleTime: 0,
    // Mantém a página anterior na tela enquanto a próxima carrega.
    placeholderData: keepPreviousData,
  })
}
