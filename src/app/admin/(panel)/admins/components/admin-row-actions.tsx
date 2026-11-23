"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { deactivateAdminAction, reactivateAdminAction, resetAdminPasswordAction } from "@/app/actions/admin-management"
import { ConfirmDialog } from "@/components/feedback"
import { Button } from "@/components/ui/button"
import type { ManagedAdmin } from "@/types/api/managed-admin.interface"
import type { HttpResponse } from "@/types/http-response.interface"

import { TemporaryPasswordDialog } from "./temporary-password-dialog"

interface AdminRowActionsProps {
  admin: ManagedAdmin
}

type PendingAction = "status" | "reset" | null

/** Desativar (com confirmação), reativar e redefinir senha (com confirmação; mostra a temporária uma vez). */
export function AdminRowActions({ admin }: AdminRowActionsProps) {
  const router = useRouter()
  const [pending, setPending] = useState<PendingAction>(null)
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null)

  async function run<T>(kind: Exclude<PendingAction, null>, call: () => Promise<HttpResponse<T>>, onData: (data: T) => void) {
    setPending(kind)
    try {
      const response = await call()
      if (response.data === undefined) {
        toast.error(response.title ?? "Não foi possível alterar o admin", { description: response.error })
        return
      }
      toast.success(response.title)
      onData(response.data)
    } catch {
      toast.error("Não foi possível alterar o admin. Verifique sua conexão e tente de novo.")
    } finally {
      setPending(null)
    }
  }

  const refresh = () => router.refresh()

  return (
    <div className="flex flex-wrap justify-end gap-2">
      <ConfirmDialog
        trigger={
          <Button type="button" size="sm" variant="outline" disabled={pending !== null} aria-label={`Redefinir senha de ${admin.nome}`}>
            Redefinir senha
          </Button>
        }
        title={`Redefinir a senha de ${admin.nome}?`}
        description="Gera uma senha temporária nova, encerra as sessões abertas dessa pessoa e a senha atual deixa de valer."
        confirmLabel="Redefinir senha"
        isPending={pending === "reset"}
        onConfirm={() => run("reset", () => resetAdminPasswordAction(admin.id), (data) => setTemporaryPassword(data.senhaTemporaria))}
      />
      {admin.ativo ? (
        <ConfirmDialog
          trigger={
            <Button type="button" size="sm" variant="destructive" disabled={pending !== null} aria-label={`Desativar ${admin.nome}`}>
              Desativar
            </Button>
          }
          title={`Desativar ${admin.nome}?`}
          description="A pessoa sai do painel na hora (as sessões abertas são encerradas) e não consegue entrar até ser reativada."
          confirmLabel="Desativar"
          variant="destructive"
          isPending={pending === "status"}
          onConfirm={() => run("status", () => deactivateAdminAction(admin.id), refresh)}
        />
      ) : (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending !== null}
          aria-label={`Reativar ${admin.nome}`}
          onClick={() => void run("status", () => reactivateAdminAction(admin.id), refresh)}
        >
          {pending === "status" ? "Aguarde..." : "Reativar"}
        </Button>
      )}
      <TemporaryPasswordDialog
        adminName={admin.nome}
        password={temporaryPassword}
        onClose={() => {
          setTemporaryPassword(null)
          refresh()
        }}
      />
    </div>
  )
}
