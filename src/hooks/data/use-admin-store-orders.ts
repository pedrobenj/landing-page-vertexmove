"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { listAdminStoreOrdersAction } from "@/app/actions/admin-store-orders"
import { API_ERROR_CODE } from "@/enums/api-error-code.enum"
import { queryKeys } from "@/lib/utils/query-keys"
import { isStoreUnavailableError, StoreUnavailableError } from "@/lib/utils/store-unavailable-error"
import { useAdminStoreOrdersFiltersStore } from "@/stores/admin-store-orders-filters-store"

/** Página atual da lista de pedidos da loja no admin (filtro e cursor no Zustand). */
export function useAdminStoreOrders() {
  const status = useAdminStoreOrdersFiltersStore((state) => state.status)
  const cursor = useAdminStoreOrdersFiltersStore((state) => state.cursor)

  return useQuery({
    queryKey: queryKeys.admin.storeOrders({ status, cursor }),
    queryFn: async () => {
      const response = await listAdminStoreOrdersAction({ status, cursor })
      if (response.code === API_ERROR_CODE.STORE_UNAVAILABLE) throw new StoreUnavailableError()
      if (!response.data) throw new Error(response.error ?? "Não foi possível carregar os pedidos")
      return response.data
    },
    // Admin: sempre atual (CLAUDE.md §10).
    staleTime: 0,
    // Mantém a página anterior na tela enquanto a próxima carrega.
    placeholderData: keepPreviousData,
    // Loja desligada: não adianta tentar de novo.
    retry: (failureCount, error) => !isStoreUnavailableError(error) && failureCount < 3,
  })
}
