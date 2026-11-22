"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"

import { setPartnerRaceActiveAction } from "@/app/actions/admin-partner-races"
import { Button } from "@/components/ui/button"

interface PartnerRaceActiveToggleProps {
  id: number
  name: string
  active: boolean
}

/** Ativar/desativar direto da lista (`PATCH { ativo }`); inativa some do site e continua no admin. */
export function PartnerRaceActiveToggle({ id, name, active }: PartnerRaceActiveToggleProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const label = active ? "Desativar" : "Ativar"

  function toggle() {
    startTransition(async () => {
      let response
      try {
        response = await setPartnerRaceActiveAction(id, !active)
      } catch {
        toast.error("Não foi possível alterar a corrida parceira. Verifique sua conexão e tente de novo.")
        return
      }
      if (response.data === undefined) {
        toast.error(response.title ?? "Não foi possível alterar a corrida parceira", { description: response.error })
        return
      }
      toast.success(response.title)
      router.refresh()
    })
  }

  return (
    <Button type="button" size="sm" variant="outline" disabled={isPending} onClick={toggle} aria-label={`${label} ${name}`}>
      {isPending ? "Aguarde..." : label}
    </Button>
  )
}
