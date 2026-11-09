import "server-only"

import { STORE_PRODUCTS_MOCK } from "@/server/mocks/store-products.mock"

import { createMockStoreRepository } from "./mock-store.repository"
import type { StoreRepository } from "./store-repository.interface"

// globalThis: mantém o estado do mock entre recarregamentos do dev server (HMR).
const globalForStore = globalThis as unknown as { mockStoreRepository?: StoreRepository }

// TODO(migracao): Task 20 — a loja vira backend falso em src/server/api/mocks/store/; por ora, sempre o mock.
export function getStoreRepository(): StoreRepository {
  globalForStore.mockStoreRepository ??= createMockStoreRepository(STORE_PRODUCTS_MOCK)
  return globalForStore.mockStoreRepository
}
