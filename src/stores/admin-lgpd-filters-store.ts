import { create } from "zustand"

import type { LgpdStatusFilter, LgpdTypeFilter } from "@/lib/utils/lgpd-labels"

interface AdminLgpdFiltersState {
  status: LgpdStatusFilter
  tipo: LgpdTypeFilter
  /** Cursores das páginas visitadas depois da primeira (o topo é a página atual). */
  cursorStack: string[]
  /** Cursor da página atual (`null` = primeira página). */
  cursor: string | null
  setStatus: (status: LgpdStatusFilter) => void
  setTipo: (tipo: LgpdTypeFilter) => void
  nextPage: (next: string) => void
  prevPage: () => void
  reset: () => void
}

const INITIAL_STATE = { status: "todos" as LgpdStatusFilter, tipo: "todos" as LgpdTypeFilter, cursorStack: [] as string[], cursor: null }

/** Filtros e paginação por cursor das solicitações do titular (só em memória). */
export const useAdminLgpdFiltersStore = create<AdminLgpdFiltersState>()((set, get) => ({
  ...INITIAL_STATE,
  setStatus: (status) => set({ status, cursorStack: [], cursor: null }),
  setTipo: (tipo) => set({ tipo, cursorStack: [], cursor: null }),
  nextPage: (next) => set({ cursorStack: [...get().cursorStack, next], cursor: next }),
  prevPage: () => {
    const cursorStack = get().cursorStack.slice(0, -1)
    set({ cursorStack, cursor: cursorStack.at(-1) ?? null })
  },
  reset: () => set(INITIAL_STATE),
}))
