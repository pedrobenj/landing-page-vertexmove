"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { cancelAdminRegistrationAction } from "@/app/actions/admin-registrations"
import { DoubleConfirmDialog } from "@/components/feedback"
import { Button } from "@/components/ui/button"
import { PAYMENT_STATUS } from "@/enums/payment-status.enum"
import { REGISTRATION_STATUS } from "@/enums/registration-status.enum"
import type { ApiAdminRegistrationDetails } from "@/types/api/admin-registration.interface"

interface CancelRegistrationButtonProps {
  registration: Pick<ApiAdminRegistrationDetails, "id" | "evento" | "codigo" | "nomeCompleto" | "status" | "pagamentos">
}

const CANCEL_REASON_MAX = 500

/**
 * Cancelar inscrição com confirmação dupla e motivo (D6; o backend exige `motivo`). Confirmada com pagamento
 * aprovado: o backend sinaliza o estorno, que entra na fila de pagamentos.
 */
export function CancelRegistrationButton({ registration }: CancelRegistrationButtonProps) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const paid =
    registration.status === REGISTRATION_STATUS.CONFIRMED &&
    registration.pagamentos.some((payment) => payment.status === PAYMENT_STATUS.APPROVED)

  async function run(motivo: string) {
    setIsPending(true)
    const response = await cancelAdminRegistrationAction({ id: registration.id, eventId: registration.evento.id, motivo })
    setIsPending(false)
    if (response.status >= 400) {
      toast.error(response.title, { description: response.error })
      return
    }
    toast.success(response.data?.estornoSinalizado ? "Inscrição cancelada; o estorno foi sinalizado" : "Inscrição cancelada")
    router.refresh()
  }

  return (
    <DoubleConfirmDialog
      trigger={
        <Button type="button" variant="destructive" disabled={isPending} className="w-full sm:w-auto">
          {isPending ? "Aguarde..." : "Cancelar inscrição"}
        </Button>
      }
      first={{
        title: "Cancelar esta inscrição?",
        description: paid
          ? `A inscrição ${registration.codigo} já foi paga: ao cancelar, a vaga é liberada e o estorno entra na fila de pagamentos.`
          : `A inscrição ${registration.codigo} ainda não foi paga: ao cancelar, a vaga é liberada.`,
        confirmLabel: "Continuar",
      }}
      reason={{ label: "Motivo do cancelamento", maxLength: CANCEL_REASON_MAX }}
      second={{
        title: "Tem certeza?",
        description: `Cancelar a inscrição de ${registration.nomeCompleto} não pode ser desfeito.`,
        confirmLabel: paid ? "Cancelar e sinalizar estorno" : "Cancelar inscrição",
      }}
      onConfirm={run}
    />
  )
}
