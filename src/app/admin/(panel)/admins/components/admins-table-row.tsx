import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { TableCell, TableRow } from "@/components/ui/table"
import { formatDateTimeSafe } from "@/lib/utils"
import type { ManagedAdmin } from "@/types/api/managed-admin.interface"

import { AdminRowActions } from "./admin-row-actions"

interface AdminsTableRowProps {
  admin: ManagedAdmin
  /** A própria conta: sem desativar/redefinir (o backend recusa com 409); a senha muda em Minha conta. */
  isSelf: boolean
  canManage: boolean
}

export function AdminsTableRow({ admin, isSelf, canManage }: AdminsTableRowProps) {
  return (
    <TableRow>
      <TableCell>
        <p className="font-semibold text-brand-navy-deep">
          {admin.nome} {isSelf && <Badge variant="secondary">Você</Badge>}
        </p>
        <p className="text-xs text-muted-foreground">{admin.email}</p>
      </TableCell>
      <TableCell className="whitespace-nowrap tabular-nums">
        {admin.ultimoAcessoEm ? formatDateTimeSafe(admin.ultimoAcessoEm) : "Nunca entrou"}
      </TableCell>
      <TableCell>
        <Badge variant={admin.ativo ? "default" : "outline"}>{admin.ativo ? "Ativo" : "Desativado"}</Badge>
      </TableCell>
      {canManage && (
        <TableCell className="text-right">
          {isSelf ? (
            <Link href="/admin/conta" className="text-sm font-semibold text-brand-navy hover:underline">
              Trocar minha senha
            </Link>
          ) : (
            <AdminRowActions admin={admin} />
          )}
        </TableCell>
      )}
    </TableRow>
  )
}
