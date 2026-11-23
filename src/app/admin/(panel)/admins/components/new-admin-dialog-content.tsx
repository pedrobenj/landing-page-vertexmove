"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import type { FormDialogControls } from "@/components/admin"
import type { CreatedManagedAdmin } from "@/types/api/managed-admin.interface"

import { NewAdminForm } from "./new-admin-form"
import { TemporaryPasswordPanel } from "./temporary-password-panel"

/**
 * Conteúdo do diálogo. O estado fica aqui (e não no `NewAdminDialog`): o FormDialog desmonta o conteúdo
 * ao fechar, então a senha temporária some da memória e não reaparece ao abrir de novo.
 */
export function NewAdminDialogContent({ close, setBusy }: FormDialogControls) {
  const router = useRouter()
  const [created, setCreated] = useState<CreatedManagedAdmin | null>(null)

  if (!created) {
    return (
      <NewAdminForm
        onBusyChange={setBusy}
        onCreated={(data) => {
          setCreated(data)
          // Atualiza a lista por trás (o refresh preserva o estado do diálogo aberto).
          router.refresh()
        }}
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm">
        <strong>{created.admin.nome}</strong> foi cadastrado(a) com a senha temporária abaixo.
      </p>
      <TemporaryPasswordPanel
        password={created.senhaTemporaria}
        onDone={close}
      />
    </div>
  )
}
