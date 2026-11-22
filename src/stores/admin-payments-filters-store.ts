import { create } from "zustand"

import type { PAYMENT_ISSUE } from "@/enums/payment-issue.enum"
import { DEFAULT_PAYMENT_ISSUE } from "@/lib/utils/payment-issue-filter-options"

interface AdminPaymentsFiltersState {
  situacao: PAYMENT_ISSUE
  /** Cursores das páginas visitadas depois da primeira (o topo é a página atual). */
  cursorStack: string[]
  /** Cursor da página atual (`null` = primeira página). */
  cursor: string | null
  setSituacao: (situacao: PAYMENT_ISSUE) => void
  nextPage: (next: string) => void
  prevPage: () => void
  reset: () => void
}

const INITIAL_STATE = { situacao: DEFAULT_PAYMENT_ISSUE as PAYMENT_ISSUE, cursorStack: [] as string[], cursor: null }

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
