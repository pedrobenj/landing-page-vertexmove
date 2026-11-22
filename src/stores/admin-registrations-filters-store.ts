import { create } from "zustand"

import type { AdminRegistrationStatusFilter } from "@/lib/utils/registration-status-filter-options"

interface AdminRegistrationsFiltersState {
  /** Corrida dos filtros: ao abrir outra corrida, os filtros voltam ao início. */
  eventId: number | null
  status: AdminRegistrationStatusFilter
  distanciaId: number | null
  /** Busca já aplicada (o campo faz debounce antes de gravar aqui). */
  busca: string
  /** Cursores das páginas visitadas depois da primeira (o topo é a página atual). */
  cursorStack: string[]
  /** Cursor da página atual (`null` = primeira página). */
  cursor: string | null
  setEvent: (eventId: number) => void
  setStatus: (status: AdminRegistrationStatusFilter) => void
  setDistance: (distanciaId: number | null) => void
  setSearch: (busca: string) => void
  nextPage: (next: string) => void
  prevPage: () => void
  reset: () => void
}

const FIRST_PAGE = { cursorStack: [] as string[], cursor: null }
const INITIAL_FILTERS = {
  status: "todos" as AdminRegistrationStatusFilter,
  distanciaId: null,
  busca: "",
  ...FIRST_PAGE,
}

/**
 * Filtros e paginação por cursor da lista de inscritos de uma corrida (CLAUDE.md §10: nunca em search
 * params, porque a busca pode ter nome do atleta). Só em memória: some ao recarregar a página.
 */
export const useAdminRegistrationsFiltersStore = create<AdminRegistrationsFiltersState>()((set, get) => ({
  eventId: null,
  ...INITIAL_FILTERS,
  setEvent: (eventId) => {
    if (get().eventId !== eventId) set({ eventId, ...INITIAL_FILTERS })
  },
  setStatus: (status) => set({ status, ...FIRST_PAGE }),
  setDistance: (distanciaId) => set({ distanciaId, ...FIRST_PAGE }),
  setSearch: (busca) => set({ busca, ...FIRST_PAGE }),
  nextPage: (next) => set({ cursorStack: [...get().cursorStack, next], cursor: next }),
  prevPage: () => {
    const cursorStack = get().cursorStack.slice(0, -1)
    set({ cursorStack, cursor: cursorStack.at(-1) ?? null })
  },
  reset: () => set({ eventId: null, ...INITIAL_FILTERS }),
}))
