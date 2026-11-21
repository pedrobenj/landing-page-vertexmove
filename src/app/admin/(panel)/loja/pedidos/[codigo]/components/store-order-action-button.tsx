"use client"

import { ConfirmDialog } from "@/components/feedback"
import { Button } from "@/components/ui/button"
import type { StoreOrderActionConfig } from "@/lib/utils/store-order-actions"

interface StoreOrderActionButtonProps {
  config: StoreOrderActionConfig
  isPending: boolean
  disabled: boolean
  /** Promise da action: a confirmação fica aberta com "Aguarde..." até ela terminar. */
  onRun: (config: StoreOrderActionConfig) => Promise<void>
}

export function StoreOrderActionButton({ config, isPending, disabled, onRun }: StoreOrderActionButtonProps) {
  return (
    <ConfirmDialog
      trigger={
        <Button type="button" variant={config.variant} disabled={disabled} className="w-full sm:w-auto">
          {isPending ? "Aguarde..." : config.label}
        </Button>
      }
      title={config.confirmation.title}
      description={config.confirmation.description}
      confirmLabel={config.confirmation.confirmLabel}
      variant={config.variant}
      isPending={isPending}
      onConfirm={() => onRun(config)}
    />
  )
}
