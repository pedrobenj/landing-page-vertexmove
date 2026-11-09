"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { listAuditAction } from "@/app/actions/admin-audit"
import { queryKeys } from "@/lib/utils/query-keys"
import { useAdminAuditStore } from "@/stores/admin-audit-store"

/** Página atual da auditoria (cursor no Zustand). */
export function useAdminAudit() {
  const cursor = useAdminAuditStore((state) => state.cursor)

  return useQuery({
    queryKey: queryKeys.admin.audit(cursor),
    queryFn: async () => {
      const response = await listAuditAction({ cursor })
      if (!response.data) throw new Error(response.error ?? "Não foi possível carregar a auditoria")
      return response.data
    },
    // Admin: sempre atual (CLAUDE.md §10).
    staleTime: 0,
    placeholderData: keepPreviousData,
  })
}
