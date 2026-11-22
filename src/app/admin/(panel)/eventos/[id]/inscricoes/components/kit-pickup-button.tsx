"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { setKitPickupAction } from "@/app/actions/admin-registrations"
import { ConfirmDialog } from "@/components/feedback"
import { Button } from "@/components/ui/button"
import { getKitPickupAction } from "@/lib/utils/admin-registration-actions"
import type { ApiAdminRegistration } from "@/types/api/admin-registration.interface"

interface KitPickupButtonProps {
  eventId: number
  registration: Pick<ApiAdminRegistration, "id" | "codigo" | "nomeCompleto" | "status" | "kitRetiradoEm">
  /** Depois do sucesso (a lista invalida a query); sem ele, `router.refresh()` (detalhe). */
  onDone?: () => void
  className?: string
}

/** "Marcar retirada" / "Desfazer retirada", com confirmação e toast. A API confere o status de novo. */
export function KitPickupButton({ eventId, registration, onDone, className }: KitPickupButtonProps) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const action = getKitPickupAction(registration)
  if (!action) return null
  const pickedUp = action === "marcar"

  async function run() {
    setIsPending(true)
    const response = await setKitPickupAction({ id: registration.id, eventId, pickedUp })
    setIsPending(false)
    if (response.status >= 400) {
      toast.error(response.title, { description: response.error })
      return
    }
    toast.success(pickedUp ? "Retirada do kit registrada" : "Retirada do kit desfeita")
    if (onDone) onDone()
    else router.refresh()
  }

  const label = pickedUp ? "Marcar retirada" : "Desfazer retirada"

  return (
    <ConfirmDialog
      trigger={
        <Button
          type="button"
          size="sm"
          variant={pickedUp ? "default" : "outline"}
          disabled={isPending}
          aria-label={`${label} de ${registration.nomeCompleto}`}
          className={className}
        >
          {isPending ? "Aguarde..." : label}
        </Button>
      }
      title={pickedUp ? "Registrar a retirada do kit?" : "Desfazer a retirada do kit?"}
      description={
        pickedUp
          ? `Confira o código ${registration.codigo} e um documento com foto de ${registration.nomeCompleto}.`
          : `A inscrição ${registration.codigo} volta a aparecer como kit não retirado.`
      }
      confirmLabel={pickedUp ? "Registrar retirada" : "Desfazer retirada"}
      isPending={isPending}
      onConfirm={run}
    />
  )
}
