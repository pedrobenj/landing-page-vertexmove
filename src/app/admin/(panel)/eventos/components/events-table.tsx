import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { AdminEvent } from "@/types/api/admin-event.interface"

import { EventsTableRow } from "./events-table-row"

interface EventsTableProps {
  events: AdminEvent[]
}

export function EventsTable({ events }: EventsTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Corrida</TableHead>
            <TableHead className="hidden sm:table-cell">Data</TableHead>
            <TableHead className="hidden md:table-cell">Local</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">
              <span className="sr-only">Ações</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <EventsTableRow key={event.id} event={event} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
