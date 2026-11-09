"use client"

import { ConfirmDialog } from "@/components/feedback"
import { Button } from "@/components/ui/button"
import type { EventLifecycleActionConfig } from "@/lib/utils/event-lifecycle-actions"

interface EventLifecycleActionButtonProps {
  config: EventLifecycleActionConfig
  isPending: boolean
  disabled: boolean
  onRun: (config: EventLifecycleActionConfig) => void
}

/** Botão de uma ação do ciclo de vida; as destrutivas passam pela confirmação. */
export function EventLifecycleActionButton({ config, isPending, disabled, onRun }: EventLifecycleActionButtonProps) {
  const { confirmation } = config
  const button = (
    <Button
      type="button"
      variant={config.variant}
      disabled={disabled}
      onClick={confirmation ? undefined : () => onRun(config)}
      className="w-full sm:w-auto"
    >
      {isPending ? "Aguarde..." : config.label}
    </Button>
  )

  if (!confirmation) return button

  return (
    <ConfirmDialog
      trigger={button}
      title={confirmation.title}
      description={confirmation.description}
      confirmLabel={confirmation.confirmLabel}
      variant={config.variant === "destructive" ? "destructive" : "default"}
      isPending={isPending}
      onConfirm={() => onRun(config)}
    />
  )
}
