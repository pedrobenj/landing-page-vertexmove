import { unstable_rethrow } from "next/navigation"
import { connection } from "next/server"

import { ProductGrid } from "@/components/store"
import { pickHomeProducts } from "@/lib/utils"
import { listStoreProducts } from "@/server/api/endpoints/store"
import { isStoreUnavailable } from "@/server/api/is-store-unavailable"
import type { StoreProduct } from "@/types/store-product.interface"

import { StoreBand } from "./store-band"

/**
 * Vitrine da loja na home (até 4 produtos, destaques primeiro). Sem produtos, loja desligada ou API
 * fora do ar, a seção some: a home não mostra erro da loja.
 */
export async function StoreHighlights() {
  // Preço e estoque mudam a cada pedido: lido a cada requisição, nunca no prerender.
  await connection()

  let products: StoreProduct[]
  try {
    products = await listStoreProducts()
  } catch (error) {
    unstable_rethrow(error)
    if (!isStoreUnavailable(error)) {
      console.error("[StoreHighlights]", error instanceof Error ? error.name : "erro desconhecido")
    }
    return null
  }

  const highlights = pickHomeProducts(products)
  if (highlights.length === 0) return null

  return (
    <StoreBand>
      <ProductGrid products={highlights} />
    </StoreBand>
  )
}
