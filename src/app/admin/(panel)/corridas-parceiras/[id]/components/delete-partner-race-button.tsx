"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { deletePartnerRaceAction } from "@/app/actions/admin-partner-races"
import { ConfirmDialog } from "@/components/feedback"
import { Button } from "@/components/ui/button"

interface DeletePartnerRaceButtonProps {
  id: number
}

/** Exclusão física com confirmação; em seguida volta para a lista. */
export function DeletePartnerRaceButton({ id }: DeletePartnerRaceButtonProps) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  async function confirmDelete() {
    setIsPending(true)
    try {
      const response = await deletePartnerRaceAction(id)
      if (response.error) {
        toast.error(response.title ?? "Não foi possível excluir a corrida parceira", { description: response.error })
        return
      }
      toast.success(response.title ?? "Corrida parceira excluída")
      router.push("/admin/corridas-parceiras")
    } catch {
      toast.error("Não foi possível excluir a corrida parceira. Verifique sua conexão e tente de novo.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <ConfirmDialog
      trigger={
        <Button type="button" variant="destructive" className="w-fit">
          Excluir corrida parceira
        </Button>
      }
      title="Excluir esta corrida parceira?"
      description="Ela some do site e do admin. Não dá para desfazer."
      confirmLabel="Excluir"
      variant="destructive"
      isPending={isPending}
      onConfirm={confirmDelete}
    />
  )
}
