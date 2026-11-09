"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useMemo, useState, useTransition } from "react"
import { toast } from "sonner"

import { deleteAdminEventAction, runEventActionAction } from "@/app/actions/admin-events"
import type { EVENT_STATUS } from "@/enums/event-status.enum"
import {
  DELETE_EVENT_ACTION,
  type EventLifecycleAction,
  type EventLifecycleActionConfig,
  getAvailableEventActions,
} from "@/lib/utils/event-lifecycle-actions"
import { queryKeys } from "@/lib/utils/query-keys"
import { useAdminEventsFiltersStore } from "@/stores/admin-events-filters-store"

import { EventLifecycleActionButton } from "./event-lifecycle-action-button"

interface EventLifecycleActionsProps {
  eventId: number
  status: EVENT_STATUS | string
}

/** Publicar, despublicar, encerrar, cancelar, restaurar e excluir — só as válidas para o status atual. */
export function EventLifecycleActions({ eventId, status }: EventLifecycleActionsProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const resetFilters = useAdminEventsFiltersStore((state) => state.reset)
  // Transição do router.refresh(): os botões ficam travados até o novo status chegar.
  const [isRefreshing, startTransition] = useTransition()
  const [runningAction, setRunningAction] = useState<EventLifecycleAction | null>(null)
  const actions = useMemo(() => getAvailableEventActions(status), [status])

  /** Resolve quando a action termina: o diálogo de confirmação mantém o "Aguarde..." até lá. */
  async function run(config: EventLifecycleActionConfig): Promise<void> {
    setRunningAction(config.action)
    try {
      const response =
        config.action === DELETE_EVENT_ACTION
          ? await deleteAdminEventAction(eventId)
          : await runEventActionAction(eventId, config.action)

      if (response.error) {
        toast.error(response.title ?? "Não foi possível alterar a corrida", { description: response.error })
        return
      }

      toast.success(config.successMessage)
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.all })
      if (config.action === DELETE_EVENT_ACTION) {
        // A página de onde o admin veio pode ter ficado vazia: a lista volta à primeira página.
        resetFilters()
        router.push("/admin/eventos")
      } else {
        startTransition(() => router.refresh())
      }
    } catch {
      toast.error("Não foi possível alterar a corrida. Verifique sua conexão e tente de novo.")
    } finally {
      setRunningAction(null)
    }
  }

  if (actions.length === 0) return null

  const isBusy = runningAction !== null || isRefreshing

  return (
    <div role="group" aria-label="Status da corrida" className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      {actions.map((config) => (
        <EventLifecycleActionButton
          key={config.action}
          config={config}
          isPending={runningAction === config.action}
          disabled={isBusy}
          onRun={run}
        />
      ))}
    </div>
  )
}
