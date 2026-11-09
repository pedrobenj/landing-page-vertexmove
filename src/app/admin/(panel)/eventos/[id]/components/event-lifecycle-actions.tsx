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

import { EventLifecycleActionButton } from "./event-lifecycle-action-button"

interface EventLifecycleActionsProps {
  eventId: number
  status: EVENT_STATUS | string
}

/** Publicar, despublicar, encerrar, cancelar, restaurar e excluir — só as válidas para o status atual. */
export function EventLifecycleActions({ eventId, status }: EventLifecycleActionsProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [runningAction, setRunningAction] = useState<EventLifecycleAction | null>(null)
  const actions = useMemo(() => getAvailableEventActions(status), [status])

  function run(config: EventLifecycleActionConfig) {
    setRunningAction(config.action)
    // A transição dura até o router.refresh() trazer o novo status: os botões ficam travados até lá.
    startTransition(async () => {
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
        if (config.action === DELETE_EVENT_ACTION) router.push("/admin/eventos")
        else router.refresh()
      } catch {
        toast.error("Não foi possível alterar a corrida. Verifique sua conexão e tente de novo.")
      } finally {
        setRunningAction(null)
      }
    })
  }

  if (actions.length === 0) return null

  return (
    <div role="group" aria-label="Status da corrida" className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      {actions.map((config) => (
        <EventLifecycleActionButton
          key={config.action}
          config={config}
          isPending={runningAction === config.action}
          disabled={isPending}
          onRun={run}
        />
      ))}
    </div>
  )
}
