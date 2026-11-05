import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { connection } from "next/server"

import { ServerError } from "@/components/feedback"
import { getStoreRepository } from "@/server/repositories/store.repository"
import type { StoreProduct } from "@/types/store-product.interface"

import { EditProduct } from "./components"

/**
 * A página bloqueia (sem <Suspense>) até ler o produto: assim o `notFound()` roda antes do streaming
 * começar e devolve um 404 de verdade (mesmo padrão de /loja/[slug]).
 */
export const instant = false

export const metadata: Metadata = { title: "Editar produto" }

export default async function EditProductPage({ params }: PageProps<"/admin/loja/produtos/[id]">) {
  await connection()
  const { id } = await params

  let product: StoreProduct | null
  try {
    product = await getStoreRepository().getProductById(id)
  } catch (error) {
    console.error("[EditProductPage]", error)
    return <ServerError title="Não foi possível carregar o produto" />
  }

  if (!product) notFound()

  return (
    <section className="flex flex-col gap-6">
      <EditProduct product={product} />
    </section>
  )
}
