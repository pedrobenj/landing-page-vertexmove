"use client"

import { Pencil, Plus } from "lucide-react"

import { FormDialog } from "@/components/admin"
import type { KitFormInput } from "@/lib/validations/kit.schema"

import { KitForm } from "./kit-form"

interface KitFormDialogProps {
  eventId: number
  /** Com kit: edição; sem: "Novo kit". */
  kit?: { id: number; nome: string }
  defaultValues: KitFormInput
}

export function KitFormDialog({ eventId, kit, defaultValues }: KitFormDialogProps) {
  return (
    <FormDialog
      title={kit ? `Editar ${kit.nome}` : "Novo kit"}
      variant={kit ? "outline" : "default"}
      size={kit ? "sm" : "default"}
      triggerAriaLabel={kit ? `Editar kit ${kit.nome}` : undefined}
      triggerLabel={
        kit ? (
          <>
            <Pencil aria-hidden="true" /> Editar
          </>
        ) : (
          <>
            <Plus aria-hidden="true" /> Novo kit
          </>
        )
      }
    >
      {({ close, setBusy }) => <KitForm eventId={eventId} kitId={kit?.id} defaultValues={defaultValues} onSaved={close} onBusyChange={setBusy} />}
    </FormDialog>
  )
}
