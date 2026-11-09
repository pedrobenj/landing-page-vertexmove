"use client"

import { Plus } from "lucide-react"

import { FormDialog } from "@/components/admin"
import type { DocumentFormInput } from "@/lib/validations/document.schema"

import { DocumentForm } from "./document-form"

interface DocumentFormDialogProps {
  eventId: number
  /** Rótulo do tipo da seção (ex.: "Regulamento"), para o nome acessível do botão. */
  typeLabel: string
  defaultValues: DocumentFormInput
}

export function DocumentFormDialog({ eventId, typeLabel, defaultValues }: DocumentFormDialogProps) {
  return (
    <FormDialog
      title="Nova versão do documento"
      description="A versão publicada não pode ser editada nem excluída."
      size="sm"
      triggerAriaLabel={`Nova versão: ${typeLabel}`}
      triggerLabel={
        <>
          <Plus aria-hidden="true" /> Nova versão
        </>
      }
    >
      {({ close, setBusy }) => <DocumentForm eventId={eventId} defaultValues={defaultValues} onSaved={close} onBusyChange={setBusy} />}
    </FormDialog>
  )
}
