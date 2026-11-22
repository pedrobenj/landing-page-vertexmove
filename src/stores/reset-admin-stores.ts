import { useAdminAuditStore } from "./admin-audit-store"
import { useAdminEventsFiltersStore } from "./admin-events-filters-store"
import { useAdminPaymentsFiltersStore } from "./admin-payments-filters-store"
import { useAdminRegistrationsFiltersStore } from "./admin-registrations-filters-store"
import { useAdminStoreOrdersFiltersStore } from "./admin-store-orders-filters-store"

/** Limpa filtros e cursores do admin (ex.: no logout, para o próximo login começar do zero). */
export function resetAdminStores() {
  useAdminEventsFiltersStore.getState().reset()
  useAdminAuditStore.getState().reset()
  useAdminStoreOrdersFiltersStore.getState().reset()
  useAdminRegistrationsFiltersStore.getState().reset()
  useAdminPaymentsFiltersStore.getState().reset()
}
