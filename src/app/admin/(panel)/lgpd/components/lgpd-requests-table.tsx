import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { AdminLgpdRequestSummary } from "@/types/api/lgpd-request.interface"

import { LgpdRequestsTableRow } from "./lgpd-requests-table-row"

interface LgpdRequestsTableProps {
  requests: AdminLgpdRequestSummary[]
}

export function LgpdRequestsTable({ requests }: LgpdRequestsTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Protocolo</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Prazo</TableHead>
            <TableHead className="text-right">
              <span className="sr-only">Ações</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <LgpdRequestsTableRow key={request.id} request={request} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
