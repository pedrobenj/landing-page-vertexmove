import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

import type { AdminEvent } from "@/types/api/admin-event.interface"

import { EventStatusBadge } from "./event-status-badge"

interface AdminEventSubpageHeaderProps {
  event: AdminEvent
  title: string
  description?: string
  /** Ação principal (ex.: "Nova distância"), alinhada à direita no desktop. */
  action?: ReactNode
}

/** Cabeçalho das páginas de cadastro de uma corrida (distâncias, kits, documentos). */
export function AdminEventSubpageHeader({ event, title, description, action }: AdminEventSubpageHeaderProps) {
  return (
    <div className="flex flex-col gap-3">
      <Link
        href={`/admin/eventos/${event.id}`}
        className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-brand-navy"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> {event.nome}
        <EventStatusBadge status={event.status} className="ml-1" />
      </Link>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold text-brand-navy">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
    </div>
  )
}
