"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { listAdminPaymentsAction } from "@/app/actions/admin-payments"
import { queryKeys } from "@/lib/utils/query-keys"
import { useAdminPaymentsFiltersStore } from "@/stores/admin-payments-filters-store"

/** Página atual da fila de pagamentos com pendência (situação e cursor no Zustand). */
export function useAdminPayments() {
  const situacao = useAdminPaymentsFiltersStore((state) => state.situacao)
  const cursor = useAdminPaymentsFiltersStore((state) => state.cursor)

  return useQuery({
    queryKey: queryKeys.admin.payments({ situacao, cursor }),
    queryFn: async () => {
      const response = await listAdminPaymentsAction({ situacao, cursor })
      if (!response.data) throw new Error(response.error ?? "Não foi possível carregar os pagamentos")
      return response.data
    },
    staleTime: 0,
    placeholderData: keepPreviousData,
  })
}
