"use client"

import { ShieldCheck } from "lucide-react"

import { AdminListError, CursorPagination } from "@/components/admin"
import { EmptyState } from "@/components/feedback"
import { Button } from "@/components/ui/button"
import { useAdminLgpdRequests } from "@/hooks/data/use-admin-lgpd-requests"
import { useAdminLgpdFiltersStore } from "@/stores/admin-lgpd-filters-store"

import { LgpdRequestsFilters } from "./lgpd-requests-filters"
import { LgpdRequestsTable } from "./lgpd-requests-table"
import { LgpdRequestsTableSkeleton } from "./lgpd-requests-table-skeleton"

export function LgpdRequestsList() {
  const { data, isPending, isError, isFetching, isPlaceholderData, refetch } = useAdminLgpdRequests()
  const cursor = useAdminLgpdFiltersStore((state) => state.cursor)
  const hasPrevious = useAdminLgpdFiltersStore((state) => state.cursorStack.length > 0)
  const reset = useAdminLgpdFiltersStore((state) => state.reset)
  const nextPage = useAdminLgpdFiltersStore((state) => state.nextPage)
  const prevPage = useAdminLgpdFiltersStore((state) => state.prevPage)
  const isFirstPage = cursor === null

  return (
    <div className="flex flex-col gap-4">
      <LgpdRequestsFilters />
      {isPending ? (
        <LgpdRequestsTableSkeleton />
      ) : isError ? (
        <AdminListError
          title="Não foi possível carregar as solicitações"
          onRetry={() => void refetch()}
          onReset={isFirstPage ? undefined : reset}
          isRetrying={isFetching}
        />
      ) : data.items.length === 0 && !isFirstPage ? (
        <EmptyState
          icon={ShieldCheck}
          title="Esta página ficou vazia."
          action={
            <Button type="button" variant="outline" onClick={reset}>
              Voltar à primeira página
            </Button>
          }
        />
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="Nenhuma solicitação com estes filtros."
          description="Os pedidos feitos em Privacidade › Solicitação aparecem aqui."
        />
      ) : (
        <div aria-busy={isPlaceholderData} className="flex flex-col gap-4 aria-busy:opacity-60">
          <LgpdRequestsTable requests={data.items} />
          <CursorPagination
            label="solicitações"
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
