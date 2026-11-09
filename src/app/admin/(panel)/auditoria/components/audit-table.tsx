import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { AuditEntry } from "@/types/api/audit-entry.interface"

import { AuditTableRow } from "./audit-table-row"

interface AuditTableProps {
  entries: AuditEntry[]
}

export function AuditTable({ entries }: AuditTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Ação</TableHead>
            <TableHead className="hidden md:table-cell">Entidade</TableHead>
            <TableHead className="hidden md:table-cell">Admin</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <AuditTableRow key={entry.id} entry={entry} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
