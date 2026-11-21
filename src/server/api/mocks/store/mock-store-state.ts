import "server-only"

import { createMockStoreRepository, type MockStoreRepository } from "./mock-store.repository"
import { STORE_PRODUCTS_SEED } from "./store-products.seed"

declare global {
  // Sobrevive ao HMR do `next dev` (o módulo é recarregado, o globalThis não). Nome novo: o antigo
  // `__vertexMockStore` guardava o repositório no formato anterior (chaves em inglês).
  var __vertexMockStoreApi: MockStoreRepository | undefined
}

export function getMockStore(): MockStoreRepository {
  globalThis.__vertexMockStoreApi ??= createMockStoreRepository(STORE_PRODUCTS_SEED)
  return globalThis.__vertexMockStoreApi
}

/** Volta ao catálogo inicial (usado nos testes). */
export function resetMockStore(): void {
  globalThis.__vertexMockStoreApi = createMockStoreRepository(STORE_PRODUCTS_SEED)
}
