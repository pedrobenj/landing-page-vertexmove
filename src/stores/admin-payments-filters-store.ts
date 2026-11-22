import { create } from "zustand"

import type { AdminPaymentIssueFilter } from "@/lib/utils/payment-issue-filter-options"

interface AdminPaymentsFiltersState {
  situacao: AdminPaymentIssueFilter
  /** Cursores das páginas visitadas depois da primeira (o topo é a página atual). */
  cursorStack: string[]
  /** Cursor da página atual (`null` = primeira página). */
  cursor: string | null
  setSituacao: (situacao: AdminPaymentIssueFilter) => void
  nextPage: (next: string) => void
  prevPage: () => void
  reset: () => void
}

const INITIAL_STATE = { situacao: "todas" as AdminPaymentIssueFilter, cursorStack: [] as string[], cursor: null }

/** Filtro e paginação por cursor da fila de pagamentos com pendência (só em memória). */
export const useAdminPaymentsFiltersStore = create<AdminPaymentsFiltersState>()((set, get) => ({
  ...INITIAL_STATE,
  setSituacao: (situacao) => set({ situacao, cursorStack: [], cursor: null }),
  nextPage: (next) => set({ cursorStack: [...get().cursorStack, next], cursor: next }),
  prevPage: () => {
    const cursorStack = get().cursorStack.slice(0, -1)
    set({ cursorStack, cursor: cursorStack.at(-1) ?? null })
  },
  reset: () => set(INITIAL_STATE),
}))
