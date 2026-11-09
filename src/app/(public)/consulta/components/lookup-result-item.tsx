import { CalendarCheck, Route, User } from "lucide-react"

import { cn, formatDateTime, getRegistrationStatusBadgeClass, getRegistrationStatusLabel } from "@/lib/utils"
import type { RegistrationLookupItem } from "@/types/api/registration.interface"

interface LookupResultItemProps {
  item: RegistrationLookupItem
}

/** Inscrição encontrada: só dados mascarados/mínimos (a API não devolve CPF, WhatsApp nem e-mail). */
export function LookupResultItem({ item }: LookupResultItemProps) {
  return (
    <li>
      <article aria-label={`${item.evento} — ${item.distancia}`} className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <h3 className="font-heading text-xl font-black text-brand-navy-deep">{item.evento}</h3>
          <span className={cn("w-fit shrink-0 rounded-full px-3 py-1 text-sm font-bold", getRegistrationStatusBadgeClass(item.status))}>
            {getRegistrationStatusLabel(item.status)}
          </span>
        </div>
        <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
          <li className="flex items-center gap-2">
            <Route aria-hidden="true" className="size-4 shrink-0 text-brand-green-text" />
            {item.distancia}
          </li>
          <li className="flex items-center gap-2">
            <User aria-hidden="true" className="size-4 shrink-0 text-brand-green-text" />
            {item.nomeMascarado}
          </li>
          <li className="flex items-center gap-2">
            <CalendarCheck aria-hidden="true" className="size-4 shrink-0 text-brand-green-text" />
            <span>
              Inscrito em <time dateTime={item.inscritoEm}>{formatDateTime(item.inscritoEm)}</time>
            </span>
          </li>
        </ul>
      </article>
    </li>
  )
}
