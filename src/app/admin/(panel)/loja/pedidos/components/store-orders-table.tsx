import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { ApiAdminStoreOrder } from "@/types/api/store-order.interface"

import { StoreOrdersTableRow } from "./store-orders-table-row"

interface StoreOrdersTableProps {
  orders: ApiAdminStoreOrder[]
}

export function StoreOrdersTable({ orders }: StoreOrdersTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pedido</TableHead>
            <TableHead className="hidden sm:table-cell">Comprador</TableHead>
            <TableHead className="hidden md:table-cell">Itens</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">
              <span className="sr-only">Ações</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <StoreOrdersTableRow key={order.codigo} order={order} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
