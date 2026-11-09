"use client"

import { Pencil, Plus } from "lucide-react"

import { FormDialog } from "@/components/admin"
import type { ShirtSizeFormInput } from "@/lib/validations/shirt-size.schema"

import { ShirtSizeForm } from "./shirt-size-form"

interface ShirtSizeFormDialogProps {
  /** Com tamanho: edição; sem: "Novo tamanho". */
  shirtSize?: { id: number; codigo: string }
  defaultValues: ShirtSizeFormInput
}

export function ShirtSizeFormDialog({ shirtSize, defaultValues }: ShirtSizeFormDialogProps) {
  return (
    <FormDialog
      title={shirtSize ? `Editar tamanho ${shirtSize.codigo}` : "Novo tamanho"}
      variant={shirtSize ? "outline" : "default"}
      size={shirtSize ? "sm" : "default"}
      triggerAriaLabel={shirtSize ? `Editar tamanho ${shirtSize.codigo}` : undefined}
      triggerLabel={
        shirtSize ? (
          <>
            <Pencil aria-hidden="true" /> Editar
          </>
        ) : (
          <>
            <Plus aria-hidden="true" /> Novo tamanho
          </>
        )
      }
    >
      {(close) => <ShirtSizeForm shirtSizeId={shirtSize?.id} defaultValues={defaultValues} onSaved={close} />}
    </FormDialog>
  )
}
