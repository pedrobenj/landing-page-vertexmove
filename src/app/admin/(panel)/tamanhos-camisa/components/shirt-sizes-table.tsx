import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { ShirtSize } from "@/types/api/shirt-size.interface"

import { ShirtSizeRow } from "./shirt-size-row"

interface ShirtSizesTableProps {
  shirtSizes: ShirtSize[]
  canManage: boolean
}

export function ShirtSizesTable({ shirtSizes, canManage }: ShirtSizesTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead className="hidden sm:table-cell">Descrição</TableHead>
            <TableHead className="hidden sm:table-cell">Ordem</TableHead>
            <TableHead>Status</TableHead>
            {canManage && (
              <TableHead className="text-right">
                <span className="sr-only">Ações</span>
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {shirtSizes.map((shirtSize) => (
            <ShirtSizeRow key={shirtSize.id} shirtSize={shirtSize} canManage={canManage} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
