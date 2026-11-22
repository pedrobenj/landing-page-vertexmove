"use client"

import { useState } from "react"
import { toast } from "sonner"

import { refundPaymentAction } from "@/app/actions/admin-payments"
import { DoubleConfirmDialog } from "@/components/feedback"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils/format-currency"

interface RefundPaymentButtonProps {
  paymentId: number
  valorCentavos: number
  onDone: () => void
}

const REFUND_REASON_MAX = 500

/** Estorno com confirmação dupla e motivo obrigatório (o backend grava na auditoria). */
export function RefundPaymentButton({ paymentId, valorCentavos, onDone }: RefundPaymentButtonProps) {
  const [isPending, setIsPending] = useState(false)
  const amount = formatCurrency(valorCentavos)

  async function run(motivo: string) {
    setIsPending(true)
    const response = await refundPaymentAction(paymentId, motivo)
    setIsPending(false)
    if (response.status >= 400) {
      toast.error(response.title, { description: response.error })
      return
    }
    toast.success("Estorno realizado")
    onDone()
  }

  return (
    <DoubleConfirmDialog
      trigger={
        <Button type="button" size="sm" variant="destructive" disabled={isPending} aria-label={`Estornar pagamento ${paymentId}`}>
          {isPending ? "Aguarde..." : "Estornar"}
        </Button>
      }
      first={{
        title: "Estornar este pagamento?",
        description: `${amount} voltam para o atleta pelo Mercado Pago. Se a inscrição estiver confirmada, ela vira estornada.`,
        confirmLabel: "Continuar",
      }}
      reason={{ label: "Motivo do estorno", maxLength: REFUND_REASON_MAX }}
      second={{
        title: "Confirmar o estorno?",
        description: `O estorno de ${amount} não pode ser desfeito.`,
        confirmLabel: `Estornar ${amount}`,
      }}
      onConfirm={run}
    />
  )
}
