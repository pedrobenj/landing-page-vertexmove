import Link from "next/link"

import { LgpdStatusBadge } from "@/components/admin"
import { Button } from "@/components/ui/button"
import { TableCell, TableRow } from "@/components/ui/table"
import { formatDateTimeSafe } from "@/lib/utils/format-date"
import { getLgpdRequestTypeLabel } from "@/lib/utils/lgpd-labels"
import type { AdminLgpdRequestSummary } from "@/types/api/lgpd-request.interface"

interface LgpdRequestsTableRowProps {
  request: AdminLgpdRequestSummary
}

/** Linha sem PII: nome mascarado; os dados completos ficam no detalhe (acesso auditado). */
export function LgpdRequestsTableRow({ request }: LgpdRequestsTableRowProps) {
  return (
    <TableRow>
      <TableCell className="whitespace-normal">
        <p className="font-semibold tabular-nums">{request.protocolo}</p>
        <p className="text-xs text-muted-foreground">{request.nomeMascarado}</p>
        <p className="text-xs text-muted-foreground tabular-nums">Aberta em {formatDateTimeSafe(request.criadoEm)}</p>
      </TableCell>
      <TableCell className="whitespace-normal">{getLgpdRequestTypeLabel(request.tipo)}</TableCell>
      <TableCell>
        <LgpdStatusBadge status={request.status} />
      </TableCell>
      <TableCell className="whitespace-normal tabular-nums">
        <p>{formatDateTimeSafe(request.prazoEm)}</p>
        {request.vencida && <p className="text-xs font-semibold text-destructive">Prazo vencido</p>}
        {request.anonimizadaEm && <p className="text-xs text-muted-foreground">Anonimizado</p>}
      </TableCell>
      <TableCell className="text-right">
        <Button asChild size="sm" variant="outline">
          <Link href={`/admin/lgpd/${request.id}`} aria-label={`Ver solicitação ${request.protocolo}`}>
            Ver
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  )
}
