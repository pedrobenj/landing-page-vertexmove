import { Pencil } from "lucide-react"
import Link from "next/link"

import { EventStatusBadge } from "@/components/admin"
import { Button } from "@/components/ui/button"
import { TableCell, TableRow } from "@/components/ui/table"
import { formatApiDate } from "@/lib/utils/format-api-date"
import type { AdminEvent } from "@/types/api/admin-event.interface"

interface EventsTableRowProps {
  event: AdminEvent
}

export function EventsTableRow({ event }: EventsTableRowProps) {
  const href = `/admin/eventos/${event.id}`
  return (
    <TableRow>
      <TableCell>
        <Link href={href} className="font-semibold text-brand-navy hover:underline">
          {event.nome}
        </Link>
        <p className="text-xs text-muted-foreground">/{event.slug}</p>
      </TableCell>
      <TableCell className="tabular-nums">
        {formatApiDate(event.dataEvento)} · {event.horarioLargada}
      </TableCell>
      <TableCell>{event.localizacaoResumo}</TableCell>
      <TableCell>
        <EventStatusBadge status={event.status} />
      </TableCell>
      <TableCell className="text-right">
        <Button asChild variant="outline" size="sm">
          <Link href={href} aria-label={`Editar ${event.nome}`}>
            <Pencil aria-hidden="true" /> Editar
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  )
}
