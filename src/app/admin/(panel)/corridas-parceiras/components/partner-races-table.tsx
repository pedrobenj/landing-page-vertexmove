import { Ticket } from "lucide-react"
import Link from "next/link"
import { unstable_rethrow } from "next/navigation"
import { connection } from "next/server"

import { ReadOnlyNotice } from "@/components/admin"
import { EmptyState, ServerError } from "@/components/feedback"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { canManageEvents } from "@/lib/utils/admin-permissions"
import { getFortalezaToday } from "@/lib/utils/get-fortaleza-today"
import { listAdminPartnerRaces } from "@/server/api/endpoints/admin-partner-races"
import { requireAdminSession } from "@/server/api/require-admin-session"
import type { AdminPartnerRace } from "@/types/api/partner-race.interface"

import { PartnerRacesTableRow } from "./partner-races-table-row"

export async function PartnerRacesTable() {
  await connection()
  // Autorização aqui, e não só no proxy (pulado em prefetch). Fora do try/catch: o redirect sobe.
  const admin = await requireAdminSession()
  const canManage = canManageEvents(admin.papel)

  let races: AdminPartnerRace[]
  try {
    races = await listAdminPartnerRaces()
  } catch (error) {
    unstable_rethrow(error)
    console.error("[PartnerRacesTable]", error instanceof Error ? error.name : "erro desconhecido")
    return <ServerError title="Não foi possível carregar as corridas parceiras" />
  }

  const today = getFortalezaToday(new Date())

  return (
    <div className="flex flex-col gap-4">
      {canManage ? (
        <div className="flex justify-end">
          <Button asChild>
            <Link href="/admin/corridas-parceiras/nova">Nova corrida parceira</Link>
          </Button>
        </div>
      ) : (
        <ReadOnlyNotice>Seu perfil tem acesso somente leitura às corridas parceiras.</ReadOnlyNotice>
      )}
      {races.length === 0 ? (
        <EmptyState icon={Ticket} title="Nenhuma corrida parceira cadastrada." />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Corrida</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Cupom</TableHead>
                <TableHead>Ordem</TableHead>
                <TableHead>Status</TableHead>
                {canManage && <TableHead className="text-right">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {races.map((race) => (
                <PartnerRacesTableRow key={race.id} race={race} isPast={race.dataEvento < today} canManage={canManage} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
