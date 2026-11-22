import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { ApiAdminPayment } from "@/types/api/admin-payment.interface"

import { PaymentsTableRow } from "./payments-table-row"

interface PaymentsTableProps {
  payments: ApiAdminPayment[]
  canManage: boolean
  onChanged: () => void
}

export function PaymentsTable({ payments, canManage, onChanged }: PaymentsTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pagamento</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead className="text-right">
              <span className="sr-only">Ações</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <PaymentsTableRow key={payment.id} payment={payment} canManage={canManage} onChanged={onChanged} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
