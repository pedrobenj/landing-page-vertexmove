"use client"

import { useQueryClient } from "@tanstack/react-query"
import { UsersRound } from "lucide-react"
import { useEffect } from "react"

import { AdminListError, CursorPagination } from "@/components/admin"
import { EmptyState } from "@/components/feedback"
import { Button } from "@/components/ui/button"
import { useAdminRegistrations } from "@/hooks/data/use-admin-registrations"
import { queryKeys } from "@/lib/utils/query-keys"
import { useAdminRegistrationsFiltersStore } from "@/stores/admin-registrations-filters-store"
import type { Distance } from "@/types/api/distance.interface"

import { RegistrationCards } from "./registration-cards"
import { RegistrationsFilters } from "./registrations-filters"
import { RegistrationsListSkeleton } from "./registrations-list-skeleton"
import { RegistrationsTable } from "./registrations-table"

interface RegistrationsListProps {
  eventId: number
  distances: Pick<Distance, "id" | "nome">[]
  canManage: boolean
}

export function RegistrationsList({ eventId, distances, canManage }: RegistrationsListProps) {
  const queryClient = useQueryClient()
  const setEvent = useAdminRegistrationsFiltersStore((state) => state.setEvent)
  const storeEventId = useAdminRegistrationsFiltersStore((state) => state.eventId)
  const { data, isPending, isError, isFetching, isPlaceholderData, refetch } = useAdminRegistrations(eventId)
  const status = useAdminRegistrationsFiltersStore((state) => state.status)
  const distanciaId = useAdminRegistrationsFiltersStore((state) => state.distanciaId)
  const busca = useAdminRegistrationsFiltersStore((state) => state.busca)
  const cursor = useAdminRegistrationsFiltersStore((state) => state.cursor)
  const hasPrevious = useAdminRegistrationsFiltersStore((state) => state.cursorStack.length > 0)
  const nextPage = useAdminRegistrationsFiltersStore((state) => state.nextPage)
  const prevPage = useAdminRegistrationsFiltersStore((state) => state.prevPage)
  const isFirstPage = cursor === null
  const hasFilters = status !== "todos" || distanciaId !== null || busca !== ""

  // Filtros de outra corrida não valem aqui.
  useEffect(() => setEvent(eventId), [eventId, setEvent])

  const refresh = () => void queryClient.invalidateQueries({ queryKey: queryKeys.admin.registrationsOf(eventId) })
  const backToFirstPage = () => useAdminRegistrationsFiltersStore.setState({ cursor: null, cursorStack: [] })

  // Antes de o efeito trocar a corrida, os filtros ainda são da anterior: espera.
  if (storeEventId !== null && storeEventId !== eventId) return <RegistrationsListSkeleton />

  return (
    <div className="flex flex-col gap-4">
      <RegistrationsFilters key={eventId} distances={distances} />
      {isPending ? (
        <RegistrationsListSkeleton />
      ) : isError ? (
        <AdminListError
          title="Não foi possível carregar as inscrições"
          onRetry={() => void refetch()}
          onReset={isFirstPage ? undefined : backToFirstPage}
          isRetrying={isFetching}
        />
      ) : data.items.length === 0 && !isFirstPage ? (
        <EmptyState
          icon={UsersRound}
          title="Esta página ficou vazia."
          action={
            <Button type="button" variant="outline" onClick={backToFirstPage}>
              Voltar à primeira página
            </Button>
          }
        />
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title={hasFilters ? "Nenhuma inscrição com estes filtros." : "Nenhuma inscrição ainda."}
          description={hasFilters ? "Mude a busca ou os filtros." : "As inscrições feitas no site aparecem aqui."}
        />
      ) : (
        <div aria-busy={isPlaceholderData} className="flex flex-col gap-4 aria-busy:opacity-60">
          <RegistrationsTable eventId={eventId} registrations={data.items} canManage={canManage} onChanged={refresh} />
          <RegistrationCards eventId={eventId} registrations={data.items} canManage={canManage} onChanged={refresh} />
          <CursorPagination
            label="inscrições"
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
