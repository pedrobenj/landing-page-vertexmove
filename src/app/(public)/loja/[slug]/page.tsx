import { ArrowLeft } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound, unstable_rethrow } from "next/navigation"

import { ServerError } from "@/components/feedback"
import { SectionBand } from "@/components/sections"
import { StoreUnavailable } from "@/components/store"
import { truncateText } from "@/lib/utils"
import { isApiError } from "@/server/api/api-error"
import { getStoreProduct } from "@/server/api/endpoints/store"
import { isStoreUnavailable } from "@/server/api/is-store-unavailable"
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

  let product: StoreProduct
  try {
    product = await getStoreProduct(slug)
  } catch (error) {
    if (isApiError(error) && error.status === 404) notFound()
    // A página trata os demais erros (loja em breve, ServerError); aqui só caímos no título padrão.
    return { title: "Loja" }
  }

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

  let product: StoreProduct | null = null
  let failure: "unavailable" | "error" | null = null
  try {
    product = await getStoreProduct(slug)
  } catch (error) {
    unstable_rethrow(error)
    if (isApiError(error) && error.status === 404) notFound()
    if (isStoreUnavailable(error)) failure = "unavailable"
    else {
      console.error("[ProductPage]", error instanceof Error ? error.name : "erro desconhecido")
      failure = "error"
    }
  }

  return (
    <SectionBand className="border-t-0" spacing="compact" containerClassName="gap-8">
      <Link
        href="/loja"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-bold text-brand-navy-deep underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> Voltar para a loja
      </Link>
      {product && <ProductDetails product={product} />}
      {failure === "unavailable" && <StoreUnavailable />}
      {failure === "error" && <ServerError title="Não foi possível carregar o produto" />}
    </SectionBand>
  )
}
