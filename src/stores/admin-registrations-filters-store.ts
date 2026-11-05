import { create } from "zustand"

import type { RegistrationFilters } from "@/types/registration-filters.interface"

interface AdminRegistrationsFiltersState extends RegistrationFilters {
  setSearch: (search: string) => void
  setFilter: <K extends keyof RegistrationFilters>(key: K, value: RegistrationFilters[K]) => void
  setPage: (page: number) => void
  reset: () => void
}

const initialFilters: RegistrationFilters = {
  search: "",
  modalityId: null,
  status: null,
  kitPickedUp: null,
  page: 1,
  pageSize: 25,
}

/** Filtros da tabela de inscritos (server-side). Entram na query key do TanStack Query. */
export const useAdminRegistrationsFiltersStore = create<AdminRegistrationsFiltersState>()((set) => ({
  ...initialFilters,
  setSearch: (search) => set({ search, page: 1 }),
  setFilter: (key, value) => set({ [key]: value, page: 1 } as Partial<RegistrationFilters>),
  setPage: (page) => set({ page }),
  reset: () => set(initialFilters),
}))
