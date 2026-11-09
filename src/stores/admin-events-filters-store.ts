import { create } from "zustand"

import type { EVENT_STATUS } from "@/enums/event-status.enum"

export type AdminEventsStatusFilter = EVENT_STATUS | "todos"

interface AdminEventsFiltersState {
  status: AdminEventsStatusFilter
  /** Cursores das páginas visitadas depois da primeira (o topo é a página atual). */
  cursorStack: string[]
  /** Cursor da página atual (`null` = primeira página). */
  cursor: string | null
  setStatus: (status: AdminEventsStatusFilter) => void
  nextPage: (next: string) => void
  prevPage: () => void
  reset: () => void
}

const INITIAL_STATE = { status: "todos" as AdminEventsStatusFilter, cursorStack: [] as string[], cursor: null }

/**
 * Filtro e paginação por cursor da lista de corridas do admin (CLAUDE.md §10: nunca em search params).
 * Só em memória: some ao recarregar a página.
 */
export const useAdminEventsFiltersStore = create<AdminEventsFiltersState>()((set, get) => ({
  ...INITIAL_STATE,
  setStatus: (status) => set({ status, cursorStack: [], cursor: null }),
  nextPage: (next) => set({ cursorStack: [...get().cursorStack, next], cursor: next }),
  prevPage: () => {
    const cursorStack = get().cursorStack.slice(0, -1)
    set({ cursorStack, cursor: cursorStack.at(-1) ?? null })
  },
  reset: () => set(INITIAL_STATE),
}))
