"use client"

import { History } from "lucide-react"
import { useEffect } from "react"

import { AdminListError, CursorPagination } from "@/components/admin"
import { EmptyState } from "@/components/feedback"
import { Button } from "@/components/ui/button"
import { useAdminAudit } from "@/hooks/data/use-admin-audit"
import { useAdminAuditStore } from "@/stores/admin-audit-store"

import { AuditTable } from "./audit-table"
import { AuditTableSkeleton } from "./audit-table-skeleton"

export function AuditList() {
  const { data, isPending, isError, isFetching, isPlaceholderData, refetch } = useAdminAudit()
  const isFirstPage = useAdminAuditStore((state) => state.cursor === null)
  const hasPrevious = useAdminAuditStore((state) => state.cursorStack.length > 0)
  const nextPage = useAdminAuditStore((state) => state.nextPage)
  const prevPage = useAdminAuditStore((state) => state.prevPage)
  const reset = useAdminAuditStore((state) => state.reset)

  // Ao sair, volta à primeira página: a próxima visita mostra as entradas mais recentes.
  useEffect(() => reset, [reset])

  if (isPending) return <AuditTableSkeleton />
  if (isError) {
    return (
      <AdminListError
        title="Não foi possível carregar a auditoria"
        onRetry={() => void refetch()}
        onReset={isFirstPage ? undefined : reset}
        isRetrying={isFetching}
      />
    )
  }

  if (data.items.length === 0) {
    return (
      <EmptyState
        icon={History}
        title={isFirstPage ? "Nenhuma ação registrada ainda." : "Esta página ficou vazia."}
        description={isFirstPage ? "Cadastros e mudanças de status aparecem aqui." : undefined}
        action={
          isFirstPage ? undefined : (
            <Button type="button" variant="outline" onClick={reset}>
              Voltar à primeira página
            </Button>
          )
        }
      />
    )
  }

  return (
    <div aria-busy={isPlaceholderData} className="flex flex-col gap-4 aria-busy:opacity-60">
      <AuditTable entries={data.items} />
      <CursorPagination
        label="auditoria"
        hasPrevious={hasPrevious}
        hasNext={Boolean(data.nextCursor)}
        isLoading={isFetching}
        onPrevious={prevPage}
        onNext={() => data.nextCursor && nextPage(data.nextCursor)}
      />
    </div>
  )
}
