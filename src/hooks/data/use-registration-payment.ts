"use client"

import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"

import { getRegistrationDetailsAction } from "@/app/actions/registration-payment"
import { shouldPollPayment } from "@/lib/utils/get-payment-view"
import { queryKeys } from "@/lib/utils/query-keys"

/** Polling curto da confirmação (§7 do CLAUDE.md): a cada 3 s por até 1 min. */
export const PAYMENT_POLL_INTERVAL_MS = 3_000
export const PAYMENT_POLL_WINDOW_MS = 60_000

/** Erro da consulta, com o status HTTP para separar "não encontrada" (404) de falha. */
export class RegistrationDetailsError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
  }
}

/**
 * Status da inscrição por código. Com `awaitingConfirmation` (voltou do Checkout Pro), consulta de novo
 * enquanto o webhook do backend não confirma, até a janela de polling acabar.
 */
export function useRegistrationPayment(code: string, awaitingConfirmation: boolean) {
  const [pollingExpired, setPollingExpired] = useState(false)

  useEffect(() => {
    if (!awaitingConfirmation) return
    const timer = setTimeout(() => setPollingExpired(true), PAYMENT_POLL_WINDOW_MS)
    return () => clearTimeout(timer)
  }, [awaitingConfirmation])

  const query = useQuery({
    queryKey: queryKeys.registrations.detail(code),
    queryFn: async () => {
      const response = await getRegistrationDetailsAction(code)
      if (!response.data) {
        throw new RegistrationDetailsError(response.error ?? "Não foi possível consultar a inscrição", response.status)
      }
      return response.data
    },
    // Pagamento: sempre atual (CLAUDE.md §10).
    staleTime: 0,
    retry: (failureCount, error) => !(error instanceof RegistrationDetailsError && error.status === 404) && failureCount < 2,
    refetchInterval: ({ state }) =>
      state.data && shouldPollPayment({ details: state.data, awaitingConfirmation, pollingExpired })
        ? PAYMENT_POLL_INTERVAL_MS
        : false,
  })

  return { ...query, pollingExpired }
}
