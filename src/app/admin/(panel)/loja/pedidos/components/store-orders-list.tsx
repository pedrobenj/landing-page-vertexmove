"use client"

import { PackageSearch } from "lucide-react"

import { AdminListError, CursorPagination } from "@/components/admin"
import { EmptyState } from "@/components/feedback"
import { StoreUnavailable } from "@/components/store/store-unavailable"
import { Button } from "@/components/ui/button"
import { useAdminStoreOrders } from "@/hooks/data/use-admin-store-orders"
import { isStoreUnavailableError } from "@/lib/utils/store-unavailable-error"
import { useAdminStoreOrdersFiltersStore } from "@/stores/admin-store-orders-filters-store"

import { StoreOrdersFilters } from "./store-orders-filters"
import { StoreOrdersTable } from "./store-orders-table"
import { StoreOrdersTableSkeleton } from "./store-orders-table-skeleton"

export function StoreOrdersList() {
  const { data, error, isPending, isError, isFetching, isPlaceholderData, refetch } = useAdminStoreOrders()
  const status = useAdminStoreOrdersFiltersStore((state) => state.status)
  const cursor = useAdminStoreOrdersFiltersStore((state) => state.cursor)
  const hasPrevious = useAdminStoreOrdersFiltersStore((state) => state.cursorStack.length > 0)
  const setStatus = useAdminStoreOrdersFiltersStore((state) => state.setStatus)
  const nextPage = useAdminStoreOrdersFiltersStore((state) => state.nextPage)
  const prevPage = useAdminStoreOrdersFiltersStore((state) => state.prevPage)
  const isFirstPage = cursor === null

  if (isStoreUnavailableError(error)) return <StoreUnavailable context="admin" />

  return (
    <div className="flex flex-col gap-4">
      <StoreOrdersFilters />
      {isPending ? (
        <StoreOrdersTableSkeleton />
      ) : isError ? (
        <AdminListError
          title="Não foi possível carregar os pedidos"
          onRetry={() => void refetch()}
          onReset={isFirstPage ? undefined : () => setStatus(status)}
          isRetrying={isFetching}
        />
      ) : data.items.length === 0 && !isFirstPage ? (
        <EmptyState
          icon={PackageSearch}
          title="Esta página ficou vazia."
          action={
            <Button type="button" variant="outline" onClick={() => setStatus(status)}>
              Voltar à primeira página
            </Button>
          }
        />
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title={status === "todos" ? "Nenhum pedido ainda." : "Nenhum pedido com este status."}
          description={status === "todos" ? "Os pedidos feitos na loja aparecem aqui." : undefined}
        />
      ) : (
        <div aria-busy={isPlaceholderData} className="flex flex-col gap-4 aria-busy:opacity-60">
          <StoreOrdersTable orders={data.items} />
          <CursorPagination
            label="pedidos"
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
