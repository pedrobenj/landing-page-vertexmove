import { connection } from "next/server"

import { AdminInfoRow } from "@/components/admin"
import { requireAdminSession } from "@/server/api/require-admin-session"

/** Nome e e-mail da conta logada (`GET /admin/me`). */
export async function AccountDetails() {
  await connection()
  const me = await requireAdminSession()
  return (
    <dl className="flex flex-col divide-y rounded-xl border bg-card px-4">
      <AdminInfoRow label="Nome" value={me.nome} />
      <AdminInfoRow label="E-mail" value={me.email} />
    </dl>
  )
}
