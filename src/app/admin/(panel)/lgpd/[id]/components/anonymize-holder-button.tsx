"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { anonymizeLgpdHolderAction } from "@/app/actions/admin-lgpd"
import { DoubleConfirmDialog } from "@/components/feedback"
import { Button } from "@/components/ui/button"
import { formatAnonymizationSummary } from "@/lib/utils/format-anonymization-summary"

interface AnonymizeHolderButtonProps {
  requestId: number
  protocolo: string
  nome: string
}

/** Anonimização com confirmação dupla: é irreversível e o aviso diz exatamente o que se perde. */
export function AnonymizeHolderButton({ requestId, protocolo, nome }: AnonymizeHolderButtonProps) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  async function run() {
    setIsPending(true)
    const response = await anonymizeLgpdHolderAction(requestId)
    setIsPending(false)
    if (response.status >= 400) {
      toast.error(response.title, { description: response.error })
      return
    }
    toast.success("Dados do titular anonimizados", { description: response.data ? formatAnonymizationSummary(response.data) : undefined })
    router.refresh()
  }

  return (
    <DoubleConfirmDialog
      trigger={
        <Button type="button" variant="destructive" disabled={isPending} className="w-full sm:w-auto sm:self-start">
          {isPending ? "Aguarde..." : "Anonimizar titular"}
        </Button>
      }
      first={{
        title: "Anonimizar os dados deste titular?",
        description: `Nome, e-mail, WhatsApp, nascimento e CPF de ${nome} serão apagados do cadastro, das inscrições e dos pedidos. Depois disso não será possível identificar a pessoa nessas inscrições nem exportar os dados dela. Valores, pagamentos e aceites continuam guardados.`,
        confirmLabel: "Continuar",
      }}
      second={{
        title: "Esta ação é irreversível",
        description: `Não há como desfazer a anonimização da solicitação ${protocolo}. Exporte os dados antes, se o titular pediu uma cópia.`,
        confirmLabel: "Anonimizar definitivamente",
      }}
      onConfirm={run}
    />
  )
}
