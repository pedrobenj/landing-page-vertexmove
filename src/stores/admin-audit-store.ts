import { create } from "zustand"

interface AdminAuditState {
  /** Cursores das páginas visitadas depois da primeira (o topo é a página atual). */
  cursorStack: string[]
  /** Cursor da página atual (`null` = primeira página). */
  cursor: string | null
  nextPage: (next: string) => void
  prevPage: () => void
  reset: () => void
}

/** Paginação por cursor da auditoria do admin (CLAUDE.md §10: nunca em search params). */
export const useAdminAuditStore = create<AdminAuditState>()((set, get) => ({
  cursorStack: [],
  cursor: null,
  nextPage: (next) => set({ cursorStack: [...get().cursorStack, next], cursor: next }),
  prevPage: () => {
    const cursorStack = get().cursorStack.slice(0, -1)
    set({ cursorStack, cursor: cursorStack.at(-1) ?? null })
  },
  reset: () => set({ cursorStack: [], cursor: null }),
}))
