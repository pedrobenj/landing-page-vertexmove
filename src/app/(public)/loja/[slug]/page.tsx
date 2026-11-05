import { ArrowLeft } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { ServerError } from "@/components/feedback"
import { truncateText } from "@/lib/utils"
import { getActiveProduct } from "@/server/queries/get-active-product"
import type { StoreProduct } from "@/types/store-product.interface"

import { ProductDetails } from "./components"

/**
 * A página bloqueia (sem <Suspense>) até ler o produto: assim o `notFound()` roda antes do streaming
 * começar e devolve um 404 de verdade em vez de 200 + noindex. O feedback de navegação a partir do
 * catálogo vem do `useLinkStatus` no card do produto.
 */
export const instant = false

const META_DESCRIPTION_MAX_LENGTH = 155

export async function generateMetadata({ params }: PageProps<"/loja/[slug]">): Promise<Metadata> {
  const { slug } = await params

  let product: StoreProduct | null
  try {
    product = await getActiveProduct(slug)
  } catch {
    // A página trata o erro (ServerError); aqui só caímos no título padrão.
    return { title: "Loja" }
  }
  if (!product) notFound()

  const description = truncateText(product.description, META_DESCRIPTION_MAX_LENGTH)
  const image = product.imageUrls[0]
  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      ...(image && { images: [{ url: image, alt: product.name }] }),
    },
  }
}

export default async function ProductPage({ params }: PageProps<"/loja/[slug]">) {
  const { slug } = await params

  let product: StoreProduct | null
  try {
    product = await getActiveProduct(slug)
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
