"use client"

import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"

import { getStoreOrderStatusAction } from "@/app/actions/store-payment"
import { ORDER_STATUS } from "@/enums/order-status.enum"
import { queryKeys } from "@/lib/utils/query-keys"

import { PAYMENT_POLL_INTERVAL_MS, PAYMENT_POLL_WINDOW_MS } from "./use-registration-payment"

/**
 * Volta do Checkout Pro com o pedido ainda pendente: consulta o status a cada 3 s por até 1 min
 * (§7 do CLAUDE.md), até o webhook do backend confirmar. Fora disso, não consulta nada.
 */
export function useStoreOrderStatus(code: string, initialStatus: ORDER_STATUS, awaitingConfirmation: boolean) {
  const enabled = awaitingConfirmation && initialStatus === ORDER_STATUS.PENDING
  const [pollingExpired, setPollingExpired] = useState(false)

  useEffect(() => {
    if (!enabled) return
    const timer = setTimeout(() => setPollingExpired(true), PAYMENT_POLL_WINDOW_MS)
    return () => clearTimeout(timer)
  }, [enabled])

  const query = useQuery({
    queryKey: queryKeys.store.orderStatus(code),
    queryFn: async () => {
      const response = await getStoreOrderStatusAction(code)
      if (!response.data) throw new Error(response.error ?? "Não foi possível consultar o pedido")
      return response.data.status
    },
    enabled,
    // Pagamento: sempre atual (CLAUDE.md §10).
    staleTime: 0,
    refetchInterval: ({ state }) =>
      !pollingExpired && (state.data ?? ORDER_STATUS.PENDING) === ORDER_STATUS.PENDING ? PAYMENT_POLL_INTERVAL_MS : false,
  })

  return { status: query.data ?? initialStatus, pollingExpired }
}
