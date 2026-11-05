import { ShoppingBag } from "lucide-react"
import { connection } from "next/server"

import { EmptyState, ServerError } from "@/components/feedback"
import { ProductGrid } from "@/components/store"
import { getStoreRepository } from "@/server/repositories/store.repository"
import type { StoreProduct } from "@/types/store-product.interface"

const FEATURED_LIMIT = 4

export async function FeaturedProducts() {
  await connection()

  let products: StoreProduct[]
  try {
    products = await getStoreRepository().listFeaturedProducts(FEATURED_LIMIT)
  } catch (error) {
    console.error("[FeaturedProducts]", error)
    return <ServerError title="Não foi possível carregar a loja" />
  }

  if (products.length === 0) {
    return <EmptyState icon={ShoppingBag} title="Produtos em breve." description="Camisas e medalhas do Vertex vão aparecer aqui." />
  }

  return <ProductGrid products={products} />
}
