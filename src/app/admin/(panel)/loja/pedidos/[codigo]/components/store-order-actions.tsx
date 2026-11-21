"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { runStoreOrderActionAction } from "@/app/actions/admin-store-orders"
import type { ORDER_STATUS } from "@/enums/order-status.enum"
import type { STORE_ORDER_ACTION } from "@/enums/store-order-action.enum"
import { getAvailableStoreOrderActions, type StoreOrderActionConfig } from "@/lib/utils/store-order-actions"

import { StoreOrderActionButton } from "./store-order-action-button"

interface StoreOrderActionsProps {
  codigo: string
  status: ORDER_STATUS
}

/** Pronto para retirada, retirado e cancelar, todos com confirmação. A API confere a transição de novo. */
export function StoreOrderActions({ codigo, status }: StoreOrderActionsProps) {
  const router = useRouter()
  const [pending, setPending] = useState<STORE_ORDER_ACTION | null>(null)
  const actions = getAvailableStoreOrderActions(status)
  if (actions.length === 0) return null

  async function run(config: StoreOrderActionConfig) {
    setPending(config.action)
    const response = await runStoreOrderActionAction(codigo, config.action)
    setPending(null)
    if (response.status >= 400) {
      toast.error(response.title, { description: response.error })
      return
    }
    toast.success(config.successMessage)
    router.refresh()
  }

  return (
    <section aria-labelledby="order-actions-title" className="flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-sm">
      <h2 id="order-actions-title" className="font-heading font-black text-brand-navy-deep">Ações</h2>
      <div className="flex flex-col gap-2 sm:flex-row">
        {actions.map((config) => (
          <StoreOrderActionButton
            key={config.action}
            config={config}
            isPending={pending === config.action}
            disabled={pending !== null}
            onRun={run}
          />
        ))}
      </div>
    </section>
  )
}
