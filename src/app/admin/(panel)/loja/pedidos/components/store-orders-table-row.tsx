import { Eye } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { TableCell, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils/format-currency"
import { formatDateTimeSafe } from "@/lib/utils/format-date"
import type { ApiAdminStoreOrder } from "@/types/api/store-order.interface"

import { StoreOrderStatusBadge } from "./store-order-status-badge"

interface StoreOrdersTableRowProps {
  order: ApiAdminStoreOrder
}

/** Um só link por linha ("Ver pedido <código>"), para o teclado e o leitor de tela não passarem duas vezes. */
export function StoreOrdersTableRow({ order }: StoreOrdersTableRowProps) {
  return (
    <TableRow>
      <TableCell className="whitespace-normal">
        <p className="font-semibold text-brand-navy tabular-nums">{order.codigo}</p>
        <p className="text-xs text-muted-foreground tabular-nums">{formatDateTimeSafe(order.criadoEm)}</p>
        {/* No celular, o comprador entra aqui no lugar da coluna escondida. */}
        <p className="text-xs text-muted-foreground sm:hidden">{order.nomeCompleto}</p>
      </TableCell>
      <TableCell className="hidden sm:table-cell">{order.nomeCompleto}</TableCell>
      <TableCell className="hidden tabular-nums md:table-cell">{order.quantidadeItens}</TableCell>
      <TableCell className="tabular-nums">{formatCurrency(order.valorTotalCentavos)}</TableCell>
      <TableCell>
        <StoreOrderStatusBadge status={order.status} />
      </TableCell>
      <TableCell className="text-right">
        <Button asChild variant="outline" size="sm">
          <Link href={`/admin/loja/pedidos/${order.codigo}`} aria-label={`Ver pedido ${order.codigo}`}>
            <Eye aria-hidden="true" /> Ver
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  )
}
