import { Users } from "lucide-react"
import { unstable_rethrow } from "next/navigation"
import { connection } from "next/server"

import { ReadOnlyNotice } from "@/components/admin"
import { EmptyState, ServerError } from "@/components/feedback"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { canManageEvents } from "@/lib/utils/admin-permissions"
import { listManagedAdmins } from "@/server/api/endpoints/admin-management"
import { requireAdminSession } from "@/server/api/require-admin-session"
import type { ManagedAdmin } from "@/types/api/managed-admin.interface"

import { AdminsTableRow } from "./admins-table-row"
import { NewAdminDialog } from "./new-admin-dialog"

export async function AdminsTable() {
  await connection()
  // Autorização aqui, e não só no proxy (pulado em prefetch). Fora do try/catch: o redirect sobe.
  const me = await requireAdminSession()
  const canManage = canManageEvents(me.papel)

  let admins: ManagedAdmin[]
  try {
    admins = await listManagedAdmins()
  } catch (error) {
    unstable_rethrow(error)
    console.error("[AdminsTable]", error instanceof Error ? error.name : "erro desconhecido")
    return <ServerError title="Não foi possível carregar os admins" />
  }

  return (
    <div className="flex flex-col gap-4">
      {canManage ? (
        <div className="flex justify-end">
          <NewAdminDialog />
        </div>
      ) : (
        <ReadOnlyNotice>Seu perfil não gerencia admins.</ReadOnlyNotice>
      )}
      {admins.length === 0 ? (
        <EmptyState icon={Users} title="Nenhum admin cadastrado." />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Último acesso</TableHead>
                <TableHead>Status</TableHead>
                {canManage && <TableHead className="text-right">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <AdminsTableRow key={admin.id} admin={admin} isSelf={admin.id === me.id} canManage={canManage} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
