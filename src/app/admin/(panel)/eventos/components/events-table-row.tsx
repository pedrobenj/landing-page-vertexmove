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

/** Um só link por linha ("Editar <nome>"), para o teclado e o leitor de tela não passarem duas vezes. */
export function EventsTableRow({ event }: EventsTableRowProps) {
  const date = `${formatApiDate(event.dataEvento)} · ${event.horarioLargada}`
  return (
    <TableRow>
      <TableCell className="whitespace-normal">
        <p className="font-semibold text-brand-navy">{event.nome}</p>
        <p className="text-xs text-muted-foreground">/{event.slug}</p>
        {/* No celular, data e local entram aqui no lugar das colunas escondidas. */}
        <p className="text-xs text-muted-foreground tabular-nums sm:hidden">{date}</p>
      </TableCell>
      <TableCell className="hidden tabular-nums sm:table-cell">{date}</TableCell>
      <TableCell className="hidden md:table-cell">{event.localizacaoResumo}</TableCell>
      <TableCell>
        <EventStatusBadge status={event.status} />
      </TableCell>
      <TableCell className="text-right">
        <Button asChild variant="outline" size="sm">
          <Link href={`/admin/eventos/${event.id}`} aria-label={`Editar ${event.nome}`}>
            <Pencil aria-hidden="true" /> Editar
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  )
}
