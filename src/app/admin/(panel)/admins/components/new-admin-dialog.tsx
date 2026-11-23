"use client"

import { FormDialog } from "@/components/admin"

import { NewAdminDialogContent } from "./new-admin-dialog-content"

/** Novo admin em diálogo; depois de criar, o mesmo diálogo mostra a senha temporária uma vez. */
export function NewAdminDialog() {
  return (
    <FormDialog
      triggerLabel="Novo admin"
      variant="default"
      title="Novo admin"
      description="A pessoa recebe uma senha temporária e troca em Minha conta."
    >
      {(controls) => <NewAdminDialogContent {...controls} />}
    </FormDialog>
  )
}
