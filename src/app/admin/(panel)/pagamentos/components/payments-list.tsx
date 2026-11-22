"use client"

import { useQueryClient } from "@tanstack/react-query"
import { BadgeCheck } from "lucide-react"

import { AdminListError, CursorPagination } from "@/components/admin"
import { EmptyState } from "@/components/feedback"
import { Button } from "@/components/ui/button"
import { useAdminPayments } from "@/hooks/data/use-admin-payments"
import { queryKeys } from "@/lib/utils/query-keys"
import { useAdminPaymentsFiltersStore } from "@/stores/admin-payments-filters-store"

import { PaymentsFilters } from "./payments-filters"
import { PaymentsTable } from "./payments-table"
import { PaymentsTableSkeleton } from "./payments-table-skeleton"

interface PaymentsListProps {
  canManage: boolean
}

export function PaymentsList({ canManage }: PaymentsListProps) {
  const queryClient = useQueryClient()
  const { data, isPending, isError, isFetching, isPlaceholderData, refetch } = useAdminPayments()
  const situacao = useAdminPaymentsFiltersStore((state) => state.situacao)
  const cursor = useAdminPaymentsFiltersStore((state) => state.cursor)
  const hasPrevious = useAdminPaymentsFiltersStore((state) => state.cursorStack.length > 0)
  const setSituacao = useAdminPaymentsFiltersStore((state) => state.setSituacao)
  const nextPage = useAdminPaymentsFiltersStore((state) => state.nextPage)
  const prevPage = useAdminPaymentsFiltersStore((state) => state.prevPage)
  const isFirstPage = cursor === null

  // Um pagamento resolvido sai da fila e muda a inscrição: invalida as duas listas.
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: [...queryKeys.admin.all, "payments"] })
    void queryClient.invalidateQueries({ queryKey: [...queryKeys.admin.all, "registrations"] })
  }

  return (
    <div className="flex flex-col gap-4">
      <PaymentsFilters />
      {isPending ? (
        <PaymentsTableSkeleton />
      ) : isError ? (
        <AdminListError
          title="Não foi possível carregar os pagamentos"
          onRetry={() => void refetch()}
          onReset={isFirstPage ? undefined : () => setSituacao(situacao)}
          isRetrying={isFetching}
        />
      ) : data.items.length === 0 && !isFirstPage ? (
        <EmptyState
          icon={BadgeCheck}
          title="Esta página ficou vazia."
          action={
            <Button type="button" variant="outline" onClick={() => setSituacao(situacao)}>
              Voltar à primeira página
            </Button>
          }
        />
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={BadgeCheck}
          title="Nenhum pagamento nesta situação."
          description="Pagamentos em análise, com estorno pendente ou valor divergente aparecem aqui."
        />
      ) : (
        <div aria-busy={isPlaceholderData} className="flex flex-col gap-4 aria-busy:opacity-60">
          <PaymentsTable payments={data.items} canManage={canManage} onChanged={refresh} />
          <CursorPagination
            label="pagamentos"
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
