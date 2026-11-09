import { TableCell, TableRow } from "@/components/ui/table"
import { formatAuditEntity, getAuditActionLabel } from "@/lib/utils/audit-labels"
import { formatDateTimeSafe } from "@/lib/utils/format-date"
import type { AuditEntry } from "@/types/api/audit-entry.interface"

interface AuditTableRowProps {
  entry: AuditEntry
}

export function AuditTableRow({ entry }: AuditTableRowProps) {
  const admin = entry.adminNome ?? "Sistema"
  const entity = formatAuditEntity(entry.entidade, entry.entidadeId)
  return (
    <TableRow>
      <TableCell className="align-top text-xs whitespace-nowrap text-muted-foreground tabular-nums sm:text-sm">
        <time dateTime={entry.criadoEm}>{formatDateTimeSafe(entry.criadoEm)}</time>
      </TableCell>
      <TableCell className="whitespace-normal">
        <p className="font-semibold text-foreground">{getAuditActionLabel(entry.acao)}</p>
        {/* No celular, admin e entidade entram aqui no lugar das colunas escondidas. */}
        <p className="text-xs text-muted-foreground md:hidden">
          {entity} · {admin}
        </p>
      </TableCell>
      <TableCell className="hidden md:table-cell">{entity}</TableCell>
      <TableCell className="hidden md:table-cell">{admin}</TableCell>
    </TableRow>
  )
}
