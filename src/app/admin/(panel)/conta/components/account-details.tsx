import { connection } from "next/server"

import { AdminInfoRow } from "@/components/admin"
import { getAdminSessionAllowingPasswordChange } from "@/server/api/require-admin-session"

/** Nome e e-mail da conta logada (`GET /admin/me`) e o aviso da troca obrigatória da senha temporária. */
export async function AccountDetails() {
  await connection()
  const me = await getAdminSessionAllowingPasswordChange()
  return (
    <div className="flex flex-col gap-4">
      {me.trocarSenha && (
        <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-medium text-destructive">
          Sua conta está com uma senha temporária. Troque a senha abaixo para liberar o painel; depois, entre de novo com a senha nova.
        </p>
      )}
      <dl className="flex flex-col divide-y rounded-xl border bg-card px-4">
        <AdminInfoRow label="Nome" value={me.nome} />
        <AdminInfoRow label="E-mail" value={me.email} />
      </dl>
    </div>
  )
}
