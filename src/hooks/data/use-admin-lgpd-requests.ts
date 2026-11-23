"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { listAdminLgpdRequestsAction } from "@/app/actions/admin-lgpd"
import { queryKeys } from "@/lib/utils/query-keys"
import { useAdminLgpdFiltersStore } from "@/stores/admin-lgpd-filters-store"

/** Página atual das solicitações do titular (filtros e cursor no Zustand). */
export function useAdminLgpdRequests() {
  const status = useAdminLgpdFiltersStore((state) => state.status)
  const tipo = useAdminLgpdFiltersStore((state) => state.tipo)
  const cursor = useAdminLgpdFiltersStore((state) => state.cursor)

  return useQuery({
    queryKey: queryKeys.admin.lgpdRequests({ status, tipo, cursor }),
    queryFn: async () => {
      const response = await listAdminLgpdRequestsAction({ status, tipo, cursor })
      if (!response.data) throw new Error(response.error ?? "Não foi possível carregar as solicitações")
      return response.data
    },
    staleTime: 0,
    placeholderData: keepPreviousData,
  })
}
