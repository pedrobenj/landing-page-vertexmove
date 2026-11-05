import "server-only"

import { env } from "@/lib/env"
import { STORE_PRODUCTS_MOCK } from "@/server/mocks/store-products.mock"

import { createMockStoreRepository } from "./mock-store.repository"
import { prismaStoreRepository } from "./prisma-store.repository"
import type { StoreRepository } from "./store-repository.interface"

// globalThis: mantém o estado do mock entre recarregamentos do dev server (HMR).
const globalForStore = globalThis as unknown as { mockStoreRepository?: StoreRepository }

export function getStoreRepository(): StoreRepository {
  if (!env.USE_MOCK_DATA) return prismaStoreRepository
  globalForStore.mockStoreRepository ??= createMockStoreRepository(STORE_PRODUCTS_MOCK)
  return globalForStore.mockStoreRepository
}
