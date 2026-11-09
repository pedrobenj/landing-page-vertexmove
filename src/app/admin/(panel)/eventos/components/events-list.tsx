"use client"

import { CalendarX } from "lucide-react"

import { CursorPagination } from "@/components/admin"
import { EmptyState, ServerError } from "@/components/feedback"
import { Button } from "@/components/ui/button"
import { useAdminEvents } from "@/hooks/data/use-admin-events"
import { useAdminEventsFiltersStore } from "@/stores/admin-events-filters-store"

import { EventsFilters } from "./events-filters"
import { EventsTable } from "./events-table"
import { EventsTableSkeleton } from "./events-table-skeleton"
import { NewEventLink } from "./new-event-link"

interface EventsListProps {
  canManage: boolean
}

export function EventsList({ canManage }: EventsListProps) {
  const { data, isPending, isError, isFetching, isPlaceholderData } = useAdminEvents()
  const status = useAdminEventsFiltersStore((state) => state.status)
  const cursor = useAdminEventsFiltersStore((state) => state.cursor)
  const hasPrevious = useAdminEventsFiltersStore((state) => state.cursorStack.length > 0)
  const setStatus = useAdminEventsFiltersStore((state) => state.setStatus)
  const nextPage = useAdminEventsFiltersStore((state) => state.nextPage)
  const prevPage = useAdminEventsFiltersStore((state) => state.prevPage)

  // Filtro e página são mantidos ao voltar de "Editar". A exclusão reinicia o store (o cursor podia
  // apontar para uma página que ficou vazia); se mesmo assim uma página vier vazia, há o atalho abaixo.
  const isFirstPage = cursor === null

  return (
    <div className="flex flex-col gap-4">
      <EventsFilters />
      {isPending ? (
        <EventsTableSkeleton />
      ) : isError ? (
        <ServerError title="Não foi possível carregar as corridas" />
      ) : data.items.length === 0 && !isFirstPage ? (
        <EmptyState
          icon={CalendarX}
          title="Esta página ficou vazia."
          action={
            <Button type="button" variant="outline" onClick={() => setStatus(status)}>
              Voltar à primeira página
            </Button>
          }
        />
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={CalendarX}
          title={status === "todos" ? "Nenhuma corrida cadastrada." : "Nenhuma corrida com este status."}
          description={canManage ? "Cadastre a primeira corrida para abrir as inscrições." : undefined}
          action={canManage ? <NewEventLink /> : undefined}
        />
      ) : (
        <div aria-busy={isPlaceholderData} className="flex flex-col gap-4 aria-busy:opacity-60">
          <EventsTable events={data.items} />
          <CursorPagination
            label="corridas"
            hasPrevious={hasPrevious}
            hasNext={Boolean(data.nextCursor)}
            isLoading={isFetching}
            onPrevious={prevPage}
            onNext={() => data.nextCursor && nextPage(data.nextCursor)}
          />
        </div>
      )}
    </div>
  )
}
