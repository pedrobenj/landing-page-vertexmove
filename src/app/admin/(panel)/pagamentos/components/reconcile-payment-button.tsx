"use client"

import { useState } from "react"
import { toast } from "sonner"

import { reconcilePaymentAction } from "@/app/actions/admin-payments"
import { ConfirmDialog } from "@/components/feedback"
import { Button } from "@/components/ui/button"

interface ReconcilePaymentButtonProps {
  paymentId: number
  onDone: () => void
}

/** Consulta o Mercado Pago e aplica o status real; confirmação simples (não é destrutivo). */
export function ReconcilePaymentButton({ paymentId, onDone }: ReconcilePaymentButtonProps) {
  const [isPending, setIsPending] = useState(false)

  async function run() {
    setIsPending(true)
    const response = await reconcilePaymentAction(paymentId)
    setIsPending(false)
    if (response.status >= 400) {
      toast.error(response.title, { description: response.error })
      return
    }
    toast.success("Pagamento conciliado com o Mercado Pago")
    onDone()
  }

  return (
    <ConfirmDialog
      trigger={
        <Button type="button" size="sm" variant="outline" disabled={isPending} aria-label={`Conciliar pagamento ${paymentId}`}>
          {isPending ? "Aguarde..." : "Conciliar"}
        </Button>
      }
      title="Conciliar com o Mercado Pago?"
      description="O status real do pagamento é consultado no Mercado Pago e aplicado à inscrição ou ao pedido."
      confirmLabel="Conciliar"
      isPending={isPending}
      onConfirm={run}
    />
  )
}
