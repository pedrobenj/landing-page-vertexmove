import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { ApiAdminRegistration } from "@/types/api/admin-registration.interface"

import { RegistrationsTableRow } from "./registrations-table-row"

interface RegistrationsTableProps {
  eventId: number
  registrations: ApiAdminRegistration[]
  canManage: boolean
  onChanged: () => void
}

/** Tabela do desktop (no celular, os cards). */
export function RegistrationsTable({ eventId, registrations, canManage, onChanged }: RegistrationsTableProps) {
  return (
    <div className="hidden overflow-x-auto rounded-xl border bg-card md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Atleta</TableHead>
            <TableHead>Distância</TableHead>
            <TableHead>Kit</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">
              <span className="sr-only">Ações</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registrations.map((registration) => (
            <RegistrationsTableRow
              key={registration.id}
              eventId={eventId}
              registration={registration}
              canManage={canManage}
              onChanged={onChanged}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
