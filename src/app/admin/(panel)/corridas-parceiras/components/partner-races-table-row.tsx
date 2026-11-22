import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { TableCell, TableRow } from "@/components/ui/table"
import { formatApiDate } from "@/lib/utils"
import type { AdminPartnerRace } from "@/types/api/partner-race.interface"

import { PartnerRaceActiveToggle } from "./partner-race-active-toggle"

interface PartnerRacesTableRowProps {
  race: AdminPartnerRace
  /** Data já passou: some do site mesmo ativa. */
  isPast: boolean
  canManage: boolean
}

export function PartnerRacesTableRow({ race, isPast, canManage }: PartnerRacesTableRowProps) {
  return (
    <TableRow>
      <TableCell>
        <Link href={`/admin/corridas-parceiras/${race.id}`} className="font-semibold text-brand-navy hover:underline">
          {race.nome}
        </Link>
        <p className="text-xs text-muted-foreground">
          {race.localNome} • {race.cidade}/{race.uf}
        </p>
      </TableCell>
      <TableCell className="whitespace-nowrap tabular-nums">{formatApiDate(race.dataEvento)}</TableCell>
      <TableCell className="whitespace-nowrap">
        <span className="font-mono font-semibold">{race.cupom}</span>
        <span className="text-muted-foreground"> · {race.descontoPercentual}%</span>
      </TableCell>
      <TableCell className="tabular-nums">{race.ordem}</TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          <Badge variant={race.ativo ? "default" : "outline"}>{race.ativo ? "Ativa" : "Inativa"}</Badge>
          {isPast && <Badge variant="secondary">Já aconteceu</Badge>}
        </div>
      </TableCell>
      {canManage && (
        <TableCell className="text-right">
          <PartnerRaceActiveToggle id={race.id} name={race.nome} active={race.ativo} />
        </TableCell>
      )}
    </TableRow>
  )
}
