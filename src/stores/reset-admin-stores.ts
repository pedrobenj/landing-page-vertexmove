import { useAdminAuditStore } from "./admin-audit-store"
import { useAdminEventsFiltersStore } from "./admin-events-filters-store"

/** Limpa filtros e cursores do admin (ex.: no logout, para o próximo login começar do zero). */
export function resetAdminStores() {
  useAdminEventsFiltersStore.getState().reset()
  useAdminAuditStore.getState().reset()
}
