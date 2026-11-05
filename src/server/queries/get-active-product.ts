import "server-only"

import { cache } from "react"

import { getStoreRepository } from "@/server/repositories/store.repository"
import type { StoreProduct } from "@/types/store-product.interface"

/** Produto ativo por slug, deduplicado por requisição (página + generateMetadata). */
export const getActiveProduct = cache(
  (slug: string): Promise<StoreProduct | null> => getStoreRepository().getActiveProductBySlug(slug),
)
