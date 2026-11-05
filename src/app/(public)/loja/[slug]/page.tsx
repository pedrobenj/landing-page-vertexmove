import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

import { ServerError } from "@/components/feedback"
import { getStoreRepository } from "@/server/repositories/store.repository"
import type { StoreProduct } from "@/types/store-product.interface"

import { ProductDetails } from "./components"

/**
 * A página bloqueia (sem <Suspense>) até ler o produto: assim o `notFound()` roda antes do streaming
 * começar e devolve um 404 de verdade em vez de 200 + noindex. A leitura é uma única consulta por slug.
 */
export const instant = false

// TODO: generateMetadata com nome/descrição/imagem do produto.
export default async function ProductPage({ params }: PageProps<"/loja/[slug]">) {
  const { slug } = await params

  let product: StoreProduct | null
  try {
    product = await getStoreRepository().getActiveProductBySlug(slug)
  } catch (error) {
    console.error("[ProductPage]", error)
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <ServerError title="Não foi possível carregar o produto" />
      </div>
    )
  }

  if (!product) notFound()

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <Link href="/loja" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-navy hover:underline">
        <ArrowLeft className="size-4" aria-hidden="true" /> Voltar para a loja
      </Link>
      <ProductDetails product={product} />
    </div>
  )
}
